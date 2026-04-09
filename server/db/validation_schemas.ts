import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  table_habits,
  table_stickers,
  table_stickers_placed,
  table_users,
  table_verification_codes,
} from "./schema";
import { z } from "zod";

export const insertHabitSchema = createInsertSchema(table_habits, {
  reps: z.number().int().positive().max(2),
  current_sticker_pack_id: z.uuid(),
  description: z.string().max(72),
}).pick({
  description: true,
  interval: true,
  reps: true,
  current_sticker_pack_id: true,
});

export const insertVerificationCodeSchema = createInsertSchema(
  table_verification_codes,
  { email: z.email().max(254).toLowerCase() },
).pick({ email: true });

export const selectVerificationCodeSchema = createSelectSchema(
  table_verification_codes,
  {
    email: z.email().max(254).toLowerCase(),
    code: z.string().regex(/^\d{6}$/),
  },
).pick({ email: true, code: true });

export const insertUserSchema = createInsertSchema(table_users, {
  email: z.email().max(254).toLowerCase(),
})
  .pick({ email: true })
  .extend({ invite_code: z.string().length(13) });

export const insertPlacedStickerSchema = createInsertSchema(
  table_stickers_placed,
  {
    habit_id: z.uuid(),
    placed_at: z
      .string()
      .length(10)
      .regex(/^\d{4}-\d{2}-\d{2}$/),
    row_idx: z.number().int().nonnegative().max(2),
  },
)
  .pick({ habit_id: true, placed_at: true, row_idx: true })
  .extend({
    pack_id: z.uuid(),
  });

export const removePlacedStickerSchema = createSelectSchema(
  table_stickers_placed,
  {
    id: z.uuid(),
    habit_id: z.uuid(),
  },
).pick({
  id: true,
  habit_id: true,
});
