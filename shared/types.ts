import type { table_habits, table_users } from "../server/db/schema";

export type User = typeof table_users.$inferSelect;
export type Habit = typeof table_habits.$inferSelect;
