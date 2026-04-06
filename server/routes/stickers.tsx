import { Hono } from "hono";
import { CtxVariables } from "../types";
import {
  insertPlacedStickerSchema,
  removePlacedStickerSchema,
} from "../db/validation_schemas";
import { db } from "../lib/db";
import { table_stickers, table_stickers_placed } from "../db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";

const stickers = new Hono<{ Variables: CtxVariables }>();

stickers.post("/place", async (c) => {
  /* Create placed sticker */

  const payload = await c.req.json();
  const validated = await insertPlacedStickerSchema.safeParse(payload);
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const { habit_id, placed_at, pack_id } = validated.data;
  const user_id = c.get("user_id");

  //if placed sticker exists but was deleted, undeleted it
  const result = await db
    .update(table_stickers_placed)
    .set({ deleted_at: null })
    .where(
      and(
        eq(table_stickers_placed.habit_id, habit_id),
        sql`${table_stickers_placed.placed_at}::date = ${placed_at}::date`,
        isNotNull(table_stickers_placed.deleted_at),
      ),
    )
    .returning({ id: table_stickers_placed.id });
  if (result.length > 0) {
    return c.json({ msg: "Sticker placed" }, 200);
  }

  //else
  //pick random sticker from current pack
  //insert placed_sticker
  const stickers = await db
    .select()
    .from(table_stickers)
    .where(eq(table_stickers.sticker_pack_id, pack_id));
  if (stickers.length === 0)
    return c.json({ msg: `No stickers found in sticker pack` }, 404);

  const rIdx = Math.floor(Math.random() * stickers.length);

  try {
    await db.insert(table_stickers_placed).values({
      user_id: user_id,
      habit_id: habit_id,
      sticker_id: stickers[rIdx].id,
      variant: "Normal",
    });
  } catch (error) {
    return c.json({ msg: "Failed to insert placed sticker" }, 500);
  }

  return c.json({ msg: "Placed sticker" }, 200);
});

stickers.post("/remove", async (c) => {
  /* Remove placed sticker */

  const payload = await c.req.json();
  const validated = await removePlacedStickerSchema.safeParse(payload);
  if (!validated.success)
    return c.json(
      {
        msg: `${validated.error.issues[0].path} ${validated.error.issues[0].message}`,
      },
      400,
    );
  const { id } = validated.data;

  const result = await db
    .update(table_stickers_placed)
    .set({ deleted_at: new Date() })
    .where(eq(table_stickers_placed.id, id))
    .returning({ id: table_stickers_placed.id });
  if (result.length > 0) {
    return c.json({ msg: "Sticker removed" }, 200);
  } else {
    return c.json({ msg: "Sticker not found to remove" }, 404);
  }
});

export default stickers;
