import { Hono } from "hono";
import { CtxVariables } from "../types";
import {
  insertPlacedStickerSchema,
  removePlacedStickerSchema,
} from "../db/validation_schemas";
import { db } from "../lib/db";
import {
  table_habits,
  table_stickers,
  table_stickers_placed,
} from "../db/schema";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { getHabitSummary } from "../lib/habits";

const stickers = new Hono<{ Variables: CtxVariables }>();

stickers.post("/place", async (c) => {
  /* Create placed sticker */

  const payload = await c.req.json();
  const validated = await insertPlacedStickerSchema.safeParse(payload);
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const {
    habit_id,
    placed_date,
    pack_id,
    row_idx,
    clientToday,
    clientWeekStart,
  } = validated.data;
  const user_id = c.get("user_id");

  //if placed sticker exists but was deleted, restore it and increment streak
  let stickerUpdateRes = [];
  try {
    await db.transaction(async (tx) => {
      //undelete sticker
      stickerUpdateRes = await tx
        .update(table_stickers_placed)
        .set({ deleted_at: null })
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            eq(table_stickers_placed.row_idx, row_idx),
            eq(table_stickers_placed.user_id, user_id),
            eq(table_stickers_placed.placed_date, placed_date),
            isNotNull(table_stickers_placed.deleted_at),
          ),
        )
        .returning({ id: table_stickers_placed.id });
      if (stickerUpdateRes.length === 0) {
        throw new Error("No sticker to restore");
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table_stickers_placed)
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            eq(table_stickers_placed.user_id, user_id),
            eq(table_stickers_placed.placed_date, placed_date),
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const [habit] = await tx
        .select({ reps: table_habits.reps })
        .from(table_habits)
        .where(
          and(eq(table_habits.id, habit_id), eq(table_habits.user_id, user_id)),
        );

      //if stickers placed equals num reps, increment streak
      const streakIncrement = count === habit.reps ? 1 : 0;
      await tx
        .update(table_habits)
        .set({
          current_streak: sql`${table_habits.current_streak} + ${streakIncrement}`,
          total_completed: sql`${table_habits.total_completed} + 1`,
        })
        .where(eq(table_habits.id, habit_id));
    });
  } catch (error) {}

  if (stickerUpdateRes.length > 0) {
    const summary = await getHabitSummary(
      clientToday,
      user_id,
      habit_id,
      clientWeekStart,
    );
    if (summary.status !== 200)
      return c.json(
        { msg: "Sticker placed but could not retrieve updated HabitSummary" },
        500,
      );

    return c.json({ msg: "Sticker placed", data: summary.data }, 200);
  }

  //else
  //pick random sticker from current pack
  const stickers = await db
    .select()
    .from(table_stickers)
    .where(eq(table_stickers.sticker_pack_id, pack_id));
  if (stickers.length === 0)
    return c.json({ msg: `No stickers found in sticker pack` }, 404);
  const rIdx = Math.floor(Math.random() * stickers.length);

  //insert placed_sticker, increment streak
  try {
    await db.transaction(async (tx) => {
      const [habit] = await tx
        .select({
          reps: table_habits.reps,
          start_date: table_habits.start_date,
        })
        .from(table_habits)
        .where(
          and(eq(table_habits.id, habit_id), eq(table_habits.user_id, user_id)),
        );
      if (habit.start_date.localeCompare(placed_date) > 0)
        throw Error("Sticker may not be placed before habit started");

      await tx.insert(table_stickers_placed).values({
        user_id: user_id,
        habit_id: habit_id,
        sticker_id: stickers[rIdx].id,
        variant: "Normal",
        row_idx: row_idx,
        placed_date: placed_date,
      });

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table_stickers_placed)
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            eq(table_stickers_placed.user_id, user_id),
            eq(table_stickers_placed.placed_date, clientToday),
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const streakIncrement = count === habit.reps ? 1 : 0;
      await tx
        .update(table_habits)
        .set({
          current_streak: sql`${table_habits.current_streak} + ${streakIncrement}`,
          total_completed: sql`${table_habits.total_completed} + 1`,
        })
        .where(eq(table_habits.id, habit_id));
    });
  } catch (error) {
    return c.json(
      { msg: "Failed to insert placed sticker and increment streak" },
      500,
    );
  }
  const summary = await getHabitSummary(
    clientToday,
    user_id,
    habit_id,
    clientWeekStart,
  );
  if (summary.status !== 200)
    return c.json(
      { msg: "Sticker placed but could not retrieve updated HabitSummary" },
      500,
    );

  return c.json({ msg: "Placed sticker", data: summary.data }, 200);
});

stickers.post("/remove", async (c) => {
  /* Remove placed sticker */
  const user_id = c.get("user_id");
  const payload = await c.req.json();
  const validated = await removePlacedStickerSchema.safeParse(payload);
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const { id, habit_id, clientWeekStart, clientToday } = validated.data;

  let result = [];
  try {
    await db.transaction(async (tx) => {
      result = await tx
        .update(table_stickers_placed)
        .set({ deleted_at: new Date() })
        .where(
          and(
            eq(table_stickers_placed.id, id),
            eq(table_stickers_placed.user_id, user_id),
          ),
        )
        .returning({
          id: table_stickers_placed.id,
          placed_date: table_stickers_placed.placed_date,
        });

      if (result.length === 0) return;

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table_stickers_placed)
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            eq(table_stickers_placed.user_id, user_id),
            eq(table_stickers_placed.placed_date, result[0].placed_date),
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const [habit] = await tx
        .select({ reps: table_habits.reps })
        .from(table_habits)
        .where(
          and(eq(table_habits.user_id, user_id), eq(table_habits.id, habit_id)),
        );

      const streakDecrement = count === habit.reps - 1 ? -1 : 0;
      await tx
        .update(table_habits)
        .set({
          current_streak: sql`${table_habits.current_streak} + ${streakDecrement}`,
          total_completed: sql`${table_habits.total_completed} - 1`,
        })
        .where(eq(table_habits.id, habit_id));
    });
  } catch (error) {
    console.log(error);
    return c.json(
      { msg: "Failed to remove placed sticker and decrement streak" },
      500,
    );
  }

  if (result.length === 0)
    return c.json({ msg: "Sticker not found to remove" }, 404);

  const summary = await getHabitSummary(
    clientToday,
    user_id,
    habit_id,
    clientWeekStart,
  );
  if (summary.status !== 200)
    return c.json(
      { msg: "Sticker removed but could not retrieve updated HabitSummary" },
      500,
    );

  return c.json({ msg: "Sticker removed", data: summary.data }, 200);
});

export default stickers;
