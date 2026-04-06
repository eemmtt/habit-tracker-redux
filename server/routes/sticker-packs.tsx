import { Hono } from "hono";
import { CtxVariables } from "../types";
import { db } from "../lib/db";
import { table_sticker_packs, table_stickers } from "../db/schema";
import { and, inArray } from "drizzle-orm";
import { StickerPackSummary } from "../../shared/types";

const sticker_packs = new Hono<{ Variables: CtxVariables }>();

sticker_packs.get("/summary", async (c) => {
  /* Get all sticker packs and preview data of their stickers */

  const user_id = c.get("user_id");

  const packs = await db.select().from(table_sticker_packs);
  if (packs.length === 0) return c.json({ msg: "No sticker packs found" }, 404);

  const stickers = await db
    .select({
      sticker_id: table_stickers.id,
      imageUrl: table_stickers.imageUrl,
      sticker_name: table_stickers.name,
      pack_id: table_stickers.sticker_pack_id,
    })
    .from(table_stickers)
    .where(
      and(
        inArray(
          table_stickers.sticker_pack_id,
          packs.map((p) => p.id),
        ),
      ),
    );

  const stickersByPack = Map.groupBy(stickers, (s) => s.pack_id);
  const summary: StickerPackSummary[] = packs.map((p) => {
    return {
      ...p,
      stickers: stickersByPack.get(p.id) ?? [],
    };
  });

  return c.json(
    { msg: `Retrieved ${packs.length} sticker packs`, data: summary },
    200,
  );
});

export default sticker_packs;
