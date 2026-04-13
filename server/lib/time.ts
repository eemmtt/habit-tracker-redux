import { dateToStr } from "../../shared/helpers";
import { HabitWeek, DayLabels } from "../../shared/types";

const DAY_LABELS: DayLabels[] = ["Mo", "Tu", "Wd", "Th", "Fr", "Sa", "Su"];

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

  return { today: dateToStr(today), days: currentWeek };
}
