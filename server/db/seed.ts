import { drizzle } from "drizzle-orm/postgres-js";
import { table_milestones, table_sticker_packs } from "./schema";
import { configDotenv } from "dotenv";

const milestones = [
  { num_days: 7, label: "One Week" },
  { num_days: 14, label: "Two Weeks" },
  { num_days: 28, label: "Four Weeks" },
  { num_days: 56, label: "Eight Weeks" },
  { num_days: 112, label: "Sixteen Weeks" },
];

async function main() {
  configDotenv();
  const db = drizzle(process.env.DATABASE_URL!);

  await db.delete(table_milestones);
  await db.insert(table_milestones).values(milestones);

  await db.delete(table_sticker_packs);
  await db.insert(table_sticker_packs).values([
    { name: "test", description: "Test sticker pack" },
    { name: "Ichabod", description: "He's just a little tiny man" },
  ]);
}

main();
