import { drizzle } from "drizzle-orm/postgres-js";
import {
  table_milestones,
  table_sticker_packs,
  table_stickers,
} from "./schema";
import { configDotenv } from "dotenv";

const milestones = [
  { num_days: 7, label: "7 d", iconKey: "ms_7" },
  { num_days: 14, label: "14 d", iconKey: "ms_14" },
  { num_days: 28, label: "28 d", iconKey: "ms_28" },
  { num_days: 50, label: "50 d", iconKey: "ms_50" },
  { num_days: 100, label: "100 d", iconKey: "ms_100" },
];

async function main() {
  configDotenv();
  const db = drizzle(process.env.DATABASE_URL!);

  await db.delete(table_milestones);
  await db.insert(table_milestones).values(milestones);

  await db.delete(table_sticker_packs);
  const stickerPackValues: (typeof table_sticker_packs.$inferInsert)[] = [
    { name: "test", description: "Test sticker pack" },
    { name: "Ichabod", description: "He's just a little tiny man" },
  ];
  const stickerPacks = await db
    .insert(table_sticker_packs)
    .values(stickerPackValues)
    .returning();

  const ichabodPackId = stickerPacks.filter((p) => p.name === "Ichabod")[0].id;
  const stickers: (typeof table_stickers.$inferInsert)[] = [
    {
      name: "Conebod",
      flavor_text:
        "Why are you harrassing this little man with beautiful green eyes?",
      sticker_pack_id: ichabodPackId,
      imageUrl:
        "https://pub-ebd25817b57543c4a8f72f58809036f8.r2.dev/Ichabod/coneBod",
    },
    {
      name: "Poumkin",
      flavor_text: "This man is a pumpkin",
      sticker_pack_id: ichabodPackId,
      imageUrl:
        "https://pub-ebd25817b57543c4a8f72f58809036f8.r2.dev/Ichabod/poumkin",
    },
    {
      name: "SquinchBod",
      flavor_text: "Are you comfortable, bud?",
      sticker_pack_id: ichabodPackId,
      imageUrl:
        "https://pub-ebd25817b57543c4a8f72f58809036f8.r2.dev/Ichabod/squinchBod",
    },
  ];

  await db.delete(table_stickers);
  await db.insert(table_stickers).values(stickers);
}

main();
