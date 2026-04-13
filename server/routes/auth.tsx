import { Hono } from "hono";
import { CtxVariables } from "../types";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { db } from "../lib/db";
import {
  table_sessions,
  table_users,
  table_verification_codes,
} from "../db/schema";
import { Resend } from "resend";
import { EmailTemplate } from "../emails/email-template";
import { and, eq, gt, sql } from "drizzle-orm";
import {
  insertUserSchema,
  insertVerificationCodeSchema,
  selectVerificationCodeSchema,
} from "../db/validation_schemas";

//TODO: implement rate limiting
const auth = new Hono<{ Variables: CtxVariables }>();
const resend = new Resend(process.env.RESEND_KEY!);

auth.post("/request-code", async (c) => {
  const payload = await c.req.json();
  const validated = await insertVerificationCodeSchema.safeParse(payload);
  if (!validated.success) return c.json({ msg: validated.error.message }, 400);
  const { email } = validated.data;

  const session = await getSignedCookie(
    c,
    process.env.COOKIE_SECRET!,
    process.env.SESSION_COOKIE!,
  );
  if (session) return c.json({ msg: "Already logged in" }, 409);

  const users = await db
    .select({ userId: table_users.id })
    .from(table_users)
    .where(eq(table_users.email, email));

  if (users.length === 0 || !users[0].userId)
    return c.json({ msg: `Verification code sent to ${email}` }, 200);

  //create verification code in table
  // const code = crypto.randomUUID();
  const code = (crypto.getRandomValues(new Uint32Array(1))[0] % 1000000)
    .toString()
    .padStart(6, "0");
  try {
    await db
      .insert(table_verification_codes)
      .values({ email: email, code: code, user_id: users[0].userId })
      .onConflictDoUpdate({
        target: table_verification_codes.email,
        set: { code: code, expires_at: sql`now() + interval '10 minutes'` },
      });
  } catch (err) {
    console.warn(`Failed to insert verification code: ${err}`);
    return c.json({ msg: `Verification code sent to ${email}` }, 200);
  }

  //email code to user
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: [email],
    subject: "Verification Code",
    react: <EmailTemplate code={code} />,
  });
  if (error) {
    console.warn(`Failed to send email: ${error}`);
    return c.json({ msg: `Verification code sent to ${email}` }, 200);
  }

  return c.json({ msg: `Verification code sent to ${email}` }, 200);
});

auth.post("/verify-code", async (c) => {
  const session = await getSignedCookie(
    c,
    process.env.COOKIE_SECRET!,
    process.env.SESSION_COOKIE!,
  );
  if (session) return c.json({ msg: "Already logged in" }, 409);

  //parse verification code
  const payload = await c.req.json();
  const validated = await selectVerificationCodeSchema.safeParse(payload);
  if (!validated.success) return c.json({ msg: validated.error.message }, 400);
  const { email, code } = validated.data;

  //lookup verification code in table
  const selectResult = await db
    .select({
      userId: table_verification_codes.user_id,
    })
    .from(table_verification_codes)
    .where(
      and(
        eq(table_verification_codes.email, email),
        eq(table_verification_codes.code, code),
        gt(table_verification_codes.expires_at, new Date()),
      ),
    );
  if (selectResult.length === 0)
    return c.json({ msg: `Invalid email or expired code` }, 401);

  const { userId } = selectResult[0];
  if (!userId) return c.json({ msg: `User malformed` }, 401);

  //add session to table and create session cookie
  const token = crypto.randomUUID();
  await db
    .insert(table_sessions)
    .values({ user_id: userId, session_token: token });

  await setSignedCookie(
    c,
    process.env.SESSION_COOKIE!,
    token,
    process.env.COOKIE_SECRET!,
    { path: "/", secure: true, httpOnly: true },
  );

  //set user to verified if not verified
  await db
    .update(table_users)
    .set({ verified: true })
    .where(eq(table_users.id, userId));

  return c.json({ msg: "Welcome" }, 200);
});

auth.post("/logout", async (c) => {
  const session = await getSignedCookie(
    c,
    process.env.COOKIE_SECRET!,
    process.env.SESSION_COOKIE!,
  );
  if (!session) return c.json({ msg: "Already logged out" }, 200);

  //delete session from table
  await db
    .delete(table_sessions)
    .where(eq(table_sessions.session_token, session));

  //delete cookie
  deleteCookie(c, process.env.SESSION_COOKIE!, {
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return c.json({ msg: "Fare well" }, 200);
});

auth.post("/signup", async (c) => {
  //parse email from form
  const payload = await c.req.json();
  const validated = insertUserSchema.safeParse(payload);
  if (!validated.success) return c.json({ msg: validated.error.message }, 400);
  const { email, invite_code } = validated.data;

  //check invite code
  if (invite_code !== process.env.INVITE_CODE!)
    return c.json({ msg: "Invalid invite code" }, 401);

  //create unverified user account
  try {
    await db.insert(table_users).values({ email: email, verified: false });
    return c.json({ msg: `Account created for ${email}` }, 200);
  } catch (err) {
    return c.json({ msg: "Signup failed" }, 409);
  }
});

auth.get("/session", async (c) => {
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

  return c.json({ msg: "Authorized" }, 200);
});

export default auth;
