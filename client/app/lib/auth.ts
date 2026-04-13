import { redirect } from "react-router";

export async function requireAuth(request: Request) {
  const result = await fetch(`${process.env.API_URL!}auth/session`, {
    headers: { Cookie: request.headers.get("Cookie") ?? "" },
  });
  if (!result.ok) throw redirect("/welcome");
}
