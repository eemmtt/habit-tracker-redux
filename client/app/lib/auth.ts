import { redirect } from "react-router";

const url = "http://localhost:3939/api/auth/session";

export async function requireAuth(request: Request) {
  const result = await fetch(url, {
    headers: { Cookie: request.headers.get("Cookie") ?? "" },
  });
  if (!result.ok) throw redirect("/welcome");
}
