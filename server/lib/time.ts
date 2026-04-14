export function getAdh(
  today_date: string,
  start_date: string,
  total_completed: number,
  reps_per_day: number,
): string {
  const today = new Date(`${today_date}T00:00:00Z`).getTime();
  const start = new Date(`${start_date}T00:00:00Z`).getTime();
  const daysElapsed = (today - start) / (24 * 60 * 60 * 1000) + 1;
  const rawAdh = (total_completed / (daysElapsed * reps_per_day)) * 100;
  return `${rawAdh.toPrecision(3)}%`;
}
