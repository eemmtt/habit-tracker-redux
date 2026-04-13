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
export type StickerSummary = {
  sticker_placed_id: string;
  placed_at: string;
  variant: "Normal" | "Foil";
  row_idx: number;
  sticker_id: string;
  imageUrl: string | null;
  sticker_name: string;
};

export type StickersByPlacedAt = Map<string, StickerSummary[]>;

export type HabitSummary = Pick<
  Habit,
  | "id"
  | "description"
  | "current_streak"
  | "interval"
  | "reps"
  | "current_sticker_pack_id"
> & {
  type_str: string;
  adh: string;
  next_ms: string;
  // stickers: Array<
  //   Pick<PlacedSticker, "id" | "placed_at" | "variant"> &
  //     Pick<Sticker, "imageUrl">
  // >;
  stickers: StickerSummary[];
};

export type StickerPackSummary = {
  id: string;
  name: string;
  description: string;
  stickers: {
    sticker_id: string;
    imageUrl: string;
    sticker_name: string;
    pack_id: string;
  }[];
};

export type DayLabels = "Mo" | "Tu" | "Wd" | "Th" | "Fr" | "Sa" | "Su";

export type HabitWeek = {
  today: string; //yyyy-mm-dd
  days: {
    date: string; //yyyy-mm-dd
    label: DayLabels;
  }[];
};

export type HabitSummaryAndWeek = {
  summaries: HabitSummary[];
  habitWeek: HabitWeek;
};
