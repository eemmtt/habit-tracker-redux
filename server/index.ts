import { Hono } from "hono";
import { getSignedCookie } from "hono/cookie";
import auth from "./routes/auth";
import { db } from "./lib/db";
import { table_sessions, table_users } from "./db/schema";
import { eq } from "drizzle-orm";
import { CtxVariables } from "./types";
import habits from "./routes/habits";
import stickers from "./routes/stickers";
import sticker_packs from "./routes/sticker-packs";

const app = new Hono<{ Variables: CtxVariables }>();

//logging
app.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

//auth
app.use(async (c, next) => {
  if (c.req.path.startsWith("/api/auth")) {
    return next();
  }

  const session = await getSignedCookie(
    c,
    process.env.COOKIE_SECRET!,
    process.env.SESSION_COOKIE!,
  );
  if (!session) return c.json({ msg: "Unauthorized" }, 401);

  const [row] = await db
    .select({ user_id: table_sessions.user_id })
    .from(table_sessions)
    .where(eq(table_sessions.session_token, session));
  if (!row?.user_id) return c.json({ msg: "Unauthorized" }, 401);

  c.set("user_id", row.user_id);

  await next();
});

app.get("/", (c) => {
  return c.text("Hello Stickler!");
});

app.route("/api/auth", auth);
app.route("/api/habits", habits);
app.route("/api/stickers", stickers);
app.route("/api/sticker-packs", sticker_packs);

app.notFound((c) => {
  return c.json({ ok: false, msg: "Woosp, it's a 404" }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ ok: false, msg: err.message }, 500);
});

export default {
  port: 3939,
  fetch: app.fetch,
};
