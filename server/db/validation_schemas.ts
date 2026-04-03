import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { table_habits, table_users, table_verification_codes } from "./schema";
import { z } from "zod";

export const insertHabitSchema = createInsertSchema(table_habits, {
  reps: z.number().int().positive().max(2),
  current_sticker_pack_id: z.uuid(),
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
  { email: z.email().max(254).toLowerCase(), code: z.uuid() },
).pick({ email: true, code: true });

export const insertUserSchema = createInsertSchema(table_users, {
  email: z.email().max(254).toLowerCase(),
})
  .pick({ email: true })
  .extend({ invite_code: z.string().length(13) });
