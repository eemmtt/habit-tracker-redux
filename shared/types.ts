import type {
  table_habits,
  table_stickers,
  table_stickers_placed,
  table_users,
} from "../server/db/schema";
import { insertHabitSchema } from "../server/db/validation_schemas";

export type User = typeof table_users.$inferSelect;
export type Habit = typeof table_habits.$inferSelect;
export type Sticker = typeof table_stickers.$inferSelect;
export type PlacedSticker = typeof table_stickers_placed.$inferSelect;

export type CreateHabitFormData = ReturnType<typeof insertHabitSchema.parse>;

export type HabitSummary = Pick<
  Habit,
  "id" | "description" | "current_streak" | "interval" | "reps"
> & {
  stickers: Array<
    Pick<PlacedSticker, "id" | "placed_at" | "variant"> &
      Pick<Sticker, "imageUrl">
  >;
};
