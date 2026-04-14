import { and, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { getAdh } from "../lib/time";
import {
  table_habits,
  table_milestones,
  table_stickers,
  table_stickers_placed,
} from "../db/schema";
import { db } from "./db";

export function getNextMs(
  streak: number,
  milestones: {
    id: number;
    num_days: number;
    label: string;
  }[],
) {
  if (streak < milestones[0].num_days) return milestones[0];
  for (let i = 0; i < milestones.length; i++) {
    if (streak > milestones[i].num_days) return milestones[i];
  }
  return milestones[milestones.length - 1];
}

export function getTypeStr(interval: string, reps: number) {
  const joined = interval + " " + reps.toString();

  switch (joined) {
    case "daily 1":
      return "Once Daily";
    case "daily 2":
      return "Twice Daily";
    case "weekly 1":
      return "Once Weekly";
    default:
      return `${reps} ${interval}`;
  }
}

export async function getHabitSummary(
  clientToday: string,
  user_id: string,
  habit_id: string,
  weekStart: string,
) {
  const [habit] = await db
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
      and(
        eq(table_habits.user_id, user_id),
        isNull(table_habits.deleted_at),
        eq(table_habits.id, habit_id),
      ),
    );
  if (!habit) {
    return { msg: "No Habit found", data: null, status: 404 };
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
        eq(table_stickers_placed.habit_id, habit.id),
        gte(table_stickers_placed.placed_date, sql`${weekStart}::date`),
        isNull(table_stickers_placed.deleted_at),
      ),
    );

  const milestones = await db.select().from(table_milestones);

  const habitStickers = stickers.map(({ habitId, ...s }) => {
    return {
      ...s,
    };
  });

  return {
    msg: "Retrieved habit",
    data: {
      ...habit,
      type_str: getTypeStr(habit.interval, habit.reps),
      next_ms: getNextMs(habit.current_streak, milestones).label,
      adh: getAdh(
        clientToday,
        habit.start_date,
        habit.total_completed,
        habit.reps,
      ),
      stickers: habitStickers,
    },
    status: 200,
  };
}
