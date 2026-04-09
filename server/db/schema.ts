import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { check } from "drizzle-orm/pg-core";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const table_users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 254 }).notNull().unique(),
  verified: boolean().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
});

export const table_sessions = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => table_users.id),
  session_token: uuid().notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").default(sql`now() + interval '30 days'`),
});

export const table_verification_codes = pgTable("verificationCodes", {
  email: varchar({ length: 254 }).notNull().unique(),
  user_id: uuid()
    .notNull()
    .references(() => table_users.id),
  code: varchar({ length: 6 }).notNull(),
  expires_at: timestamp("expires_at").default(
    sql`now() + interval '10 minutes'`,
  ),
});

export const habitTypeEnum = pgEnum("habitType", ["daily", "weekly"]);

export const table_habits = pgTable(
  "habits",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => table_users.id),
    description: varchar({ length: 72 }).notNull(),
    started_at: timestamp("started_at").defaultNow().notNull(),
    deleted_at: timestamp("deleted_at"),
    interval: habitTypeEnum().notNull(),
    reps: integer().notNull().default(1),
    current_sticker_pack_id: uuid()
      .notNull()
      .references(() => table_sticker_packs.id),
    current_streak: integer().notNull().default(0),
    max_streak: integer().notNull().default(0),
    last_completed_at: timestamp("last_completed_at"),
    total_completed: integer().notNull().default(0),
  },
  (t) => [
    check("positive streak", sql`${t.current_streak} >= 0`),
    check("positive completed", sql`${t.total_completed} >= 0`),
  ],
);

export const table_sticker_packs = pgTable("stickerPacks", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 128 }).notNull().unique(),
  description: varchar({ length: 512 }).notNull(),
});

export const table_stickers = pgTable("stickers", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 128 }).notNull().unique(),
  flavor_text: varchar({ length: 512 }).notNull(),
  sticker_pack_id: uuid()
    .notNull()
    .references(() => table_sticker_packs.id),
  imageUrl: varchar({ length: 2048 }).notNull(),
});

export const stickerVariantEnum = pgEnum("stickerVariant", ["Normal", "Foil"]);

export const table_stickers_placed = pgTable(
  "stickersPlaced",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => table_users.id),
    habit_id: uuid()
      .notNull()
      .references(() => table_habits.id),
    sticker_id: uuid()
      .notNull()
      .references(() => table_stickers.id),
    placed_at: timestamp("placed_at").defaultNow().notNull(),
    deleted_at: timestamp("deleted_at"),
    variant: stickerVariantEnum().notNull(),
    row_idx: integer().notNull().default(0),
  },
  (t) => [unique().on(t.habit_id, t.placed_at, t.row_idx)],
);

export const table_milestones = pgTable("milestones", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  num_days: integer().notNull(),
  label: varchar({ length: 255 }).notNull(),
  iconKey: text("iconKey").notNull().default("ms_default"),
});
