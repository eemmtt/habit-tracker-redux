import { Hono } from "hono";
import { CtxVariables } from "../types";
import {
  insertHabitSchema,
  selectHabitsSchema,
} from "../db/validation_schemas";
import { db } from "../lib/db";
import {
  table_habits,
  table_milestones,
  table_stickers,
  table_stickers_placed,
} from "../db/schema";
import { and, eq, gte, inArray, isNull, sql } from "drizzle-orm";

import type { HabitSummary } from "../../shared/types";
import { getNextMs, getTypeStr } from "../lib/habits";
import { getAdh } from "../lib/time";

const habits = new Hono<{ Variables: CtxVariables }>();

habits.post("/", async (c) => {
  //create habit

  const payload = await c.req.json();
  const validated = await insertHabitSchema.safeParse(payload);
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const { description, interval, reps, current_sticker_pack_id, clientToday } =
    validated.data;

  const user_id = c.get("user_id");

  try {
    await db.insert(table_habits).values({
      user_id: user_id,
      description: description,
      interval: interval,
      reps: reps,
      start_date: clientToday,
      current_sticker_pack_id: current_sticker_pack_id,
    });
  } catch (error) {
    console.warn(error);
    return c.json({ msg: "Failed to insert habit" }, 500);
  }

  return c.json({ msg: `Habit "${description}" created` }, 200);
});

habits.get("/summary", async (c) => {
  //get habit data for user necessary for dashboard view, return HabitSummary[]

  const validated = await selectHabitsSchema.safeParse({
    clientWeekStart: c.req.query("weekStart"),
    clientToday: c.req.query("today"),
  });
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const { clientWeekStart, clientToday } = validated.data;

  const user_id = c.get("user_id");
  const habits = await db
    .select({
      id: table_habits.id,
      description: table_habits.description,
      current_streak: table_habits.current_streak,
      interval: table_habits.interval,
      reps: table_habits.reps,
      current_sticker_pack_id: table_habits.current_sticker_pack_id,
      start_date: table_habits.start_date,
      total_completed: table_habits.total_completed,
    })
    .from(table_habits)
    .where(
      and(eq(table_habits.user_id, user_id), isNull(table_habits.deleted_at)),
    );
  if (habits.length === 0) {
    return c.json({ msg: "No Habits found", data: [] }, 200);
  }

  const stickers = await db
    .select({
      habitId: table_stickers_placed.habit_id,
      sticker_placed_id: table_stickers_placed.id,
      placed_date: table_stickers_placed.placed_date,
      variant: table_stickers_placed.variant,
      sticker_id: table_stickers.id,
      imageUrl: table_stickers.imageUrl,
      sticker_name: table_stickers.name,
      row_idx: table_stickers_placed.row_idx,
    })
    .from(table_stickers_placed)
    .innerJoin(
      table_stickers,
      eq(table_stickers.id, table_stickers_placed.sticker_id),
    )
    .where(
      and(
        inArray(
          table_stickers_placed.habit_id,
          habits.map((h) => h.id),
        ),
        gte(table_stickers_placed.placed_date, sql`${clientWeekStart}::date`),
        isNull(table_stickers_placed.deleted_at),
      ),
    );

  const milestones = await db.select().from(table_milestones);

  const stickersByHabitMap = Map.groupBy(stickers, (s) => s.habitId);
  const summaries: HabitSummary[] = habits
    .map((h) => {
      const habitStickers = (stickersByHabitMap.get(h.id) ?? []).map(
        ({ habitId, ...s }) => {
          return {
            ...s,
          };
        },
      );
      return {
        ...h,
        type_str: getTypeStr(h.interval, h.reps),
        next_ms: getNextMs(h.current_streak, milestones).label,
        adh: getAdh(clientToday, h.start_date, h.total_completed, h.reps),
        stickers: habitStickers,
      };
    })
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return c.json(
    {
      msg: `Found ${habits.length} habits with ${stickers.length} stickers`,
      data: summaries,
    },
    200,
  );
});

habits.get("/:id", async (c) => {
  //get complete habit data
});

habits.post("/:id/delete", async (c) => {
  //delete habit
  const user_id = c.get("user_id");
  const habit_id = c.req.param("id");
  const result = await db
    .update(table_habits)
    .set({ deleted_at: new Date() })
    .where(
      and(eq(table_habits.id, habit_id), eq(table_habits.user_id, user_id)),
    )
    .returning({ desc: table_habits.description });
  if (result.length === 0) {
    return c.json({ msg: "Failed to delete habit" }, 500);
  }

  return c.json({ msg: `Habit "${result[0].desc}" deleted.` }, 200);
});

habits.get("/:id/summary", async (c) => {
  //get habit data necessary for dashboard view
});

export default habits;
