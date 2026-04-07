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
import { dateToStr } from "../../shared/helpers";
import { getHabitSummary } from "../lib/habits";
import { HabitSummary } from "../../shared/types";

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
  const { habit_id, placed_at, pack_id, row_idx } = validated.data;
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
            sql`${table_stickers_placed.placed_at}::date = ${placed_at}::date`,
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
            sql`${table_stickers_placed.placed_at}::date = ${placed_at}::date`,
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const [habit] = await tx
        .select({ reps: table_habits.reps })
        .from(table_habits)
        .where(eq(table_habits.id, habit_id));

      if (count === habit.reps) {
        await tx
          .update(table_habits)
          .set({
            current_streak: sql`${table_habits.current_streak} + 1`,
            total_completed: sql`${table_habits.total_completed} + 1`,
          })
          .where(eq(table_habits.id, habit_id));
      }
    });
  } catch (error) {}

  if (stickerUpdateRes.length > 0) {
    const summary = await getHabitSummary(user_id, habit_id);
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
      await tx.insert(table_stickers_placed).values({
        user_id: user_id,
        habit_id: habit_id,
        sticker_id: stickers[rIdx].id,
        variant: "Normal",
        row_idx: row_idx,
      });

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table_stickers_placed)
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            sql`${table_stickers_placed.placed_at}::date = CURRENT_DATE`,
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const [habit] = await tx
        .select({ reps: table_habits.reps })
        .from(table_habits)
        .where(eq(table_habits.id, habit_id));

      if (count === habit.reps) {
        await tx
          .update(table_habits)
          .set({
            current_streak: sql`${table_habits.current_streak} + 1`,
            total_completed: sql`${table_habits.total_completed} + 1`,
          })
          .where(eq(table_habits.id, habit_id));
      }
    });
  } catch (error) {
    return c.json(
      { msg: "Failed to insert placed sticker and increment streak" },
      500,
    );
  }
  const summary = await getHabitSummary(user_id, habit_id);
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
  const { id, habit_id } = validated.data;

  let result = [];
  try {
    await db.transaction(async (tx) => {
      result = await tx
        .update(table_stickers_placed)
        .set({ deleted_at: new Date() })
        .where(eq(table_stickers_placed.id, id))
        .returning({
          id: table_stickers_placed.id,
          placed_at: table_stickers_placed.placed_at,
        });

      if (result.length === 0) return;

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table_stickers_placed)
        .where(
          and(
            eq(table_stickers_placed.habit_id, habit_id),
            sql`${table_stickers_placed.placed_at}::date = ${dateToStr(result[0].placed_at)}::date`,
            isNull(table_stickers_placed.deleted_at),
          ),
        );

      const [habit] = await tx
        .select({ reps: table_habits.reps })
        .from(table_habits)
        .where(eq(table_habits.id, habit_id));

      if (count === habit.reps - 1) {
        await tx
          .update(table_habits)
          .set({
            current_streak: sql`${table_habits.current_streak} - 1`,
            total_completed: sql`${table_habits.total_completed} - 1`,
          })
          .where(eq(table_habits.id, habit_id));
      }
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

  const summary = await getHabitSummary(user_id, habit_id);
  if (summary.status !== 200)
    return c.json(
      { msg: "Sticker removed but could not retrieve updated HabitSummary" },
      500,
    );

  return c.json({ msg: "Sticker removed", data: summary.data }, 200);
});

export default stickers;
