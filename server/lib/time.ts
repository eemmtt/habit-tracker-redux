import { HabitWeek, DayLabels } from "../../shared/types";

const DAY_LABELS: DayLabels[] = ["Mo", "Tu", "Wd", "Th", "Fr", "Sa", "Su"];

export function dateToStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHabitWeek(): HabitWeek {
  const today = new Date();
  const monday = new Date(
    today.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1),
    ),
  );

  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { date: dateToStr(date), label: DAY_LABELS[i] };
  });

  return { today: dateToStr(new Date()), days: currentWeek };
}

export function getAdh(
  started_at: Date,
  total_completed: number,
  reps_per_day: number,
): string {
  const now = new Date();
  const startDay = Date.UTC(
    started_at.getFullYear(),
    started_at.getMonth(),
    started_at.getDate(),
  );
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysElapsed = (today - startDay) / (24 * 60 * 60 * 1000) + 1;
  const rawAdh = (total_completed / (daysElapsed * reps_per_day)) * 100;
  return `${rawAdh.toPrecision(3)}%`;
}
