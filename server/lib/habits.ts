import { and, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { dateToStr } from "../../shared/helpers";
import { HabitSummary } from "../../shared/types";
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

export function getAdh(started_at: Date, total_completed: number): string {
  const now = new Date();
  const startDay = Date.UTC(started_at.getFullYear(), started_at.getMonth(), started_at.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysElapsed = (today - startDay) / (24 * 60 * 60 * 1000) + 1;
  const rawAdh = (total_completed / daysElapsed) * 100;
  return `${rawAdh.toPrecision(3)}%`;
}

export async function getHabitSummary(user_id: string, habit_id: string) {
  const [habit] = await db
    .select({
      id: table_habits.id,
      description: table_habits.description,
      current_streak: table_habits.current_streak,
      interval: table_habits.interval,
      reps: table_habits.reps,
      current_sticker_pack_id: table_habits.current_sticker_pack_id,
      started_at: table_habits.started_at,
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
      placed_at: table_stickers_placed.placed_at,
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
        gte(table_stickers_placed.placed_at, sql`date_trunc('week', now())`),
        isNull(table_stickers_placed.deleted_at),
      ),
    );

  const milestones = await db.select().from(table_milestones);

  const habitStickers = stickers.map(({ habitId, placed_at, ...s }) => {
    return {
      ...s,
      placed_at: dateToStr(placed_at),
    };
  });

  return {
    msg: "Retrieved habit",
    data: {
      ...habit,
      type_str: getTypeStr(habit.interval, habit.reps),
      next_ms: getNextMs(habit.current_streak, milestones).label,
      adh: getAdh(habit.started_at, habit.total_completed),
      stickers: habitStickers,
    },
    status: 200,
  };
}
