import type { DayLabels, HabitWeek } from "@shared/types";
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

  return { today: getToday(), days: currentWeek };
}

export function getWeekStart() {
  const today = new Date();
  const monday = new Date(
    today.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1),
    ),
  );
  return dateToStr(monday);
}

export function getToday() {
  return dateToStr(new Date());
}
