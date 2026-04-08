import LoginForm from "~/ui/LoginForm";
import type { Route } from "./+types/welcome";
import SignupForm from "~/ui/SignupForm";
import { useState } from "react";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome" },
    { name: "description", content: "Sticky Habit Tracker Login" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const cookie = request.headers.get("cookie") ?? "";

  switch (intent) {
    case "request": {
      const res = await fetch(`${process.env.API_URL!}api/auth/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, res: data };
    }
    case "verify": {
      const res = await fetch(`${process.env.API_URL!}api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: JSON.stringify({
          email: formData.get("email"),
          code: formData.get("code"),
        }),
      });
      const setCookie = res.headers.get("set-cookie");
      return new Response(JSON.stringify({ ok: res.ok, status: res.status }), {
        headers: {
          "Content-Type": "application/json",
          ...(setCookie ? { "Set-Cookie": setCookie } : {}),
        },
      });
    }
    case "signup": {
      const res = await fetch(`${process.env.API_URL!}api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: JSON.stringify({
          email: formData.get("email"),
          invite_code: formData.get("invite_code"),
        }),
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, res: data };
    }
    case "logout": {
      const res = await fetch(`${process.env.API_URL!}api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: "",
      });
      const setCookie = res.headers.get("set-cookie");
      return redirect("/welcome", {
        headers: {
          ...(setCookie ? { "Set-Cookie": setCookie } : {}),
        },
      });
    }
    default:
      break;
  }
}

export default function Welcome() {
  const [formState, setFormState] = useState<"login" | "register">("login");
  return (
    <main className="flex flex-col items-center font-mono min-h-screen gap-4 pt-8">
      <div className="flex flex-col items-center w-75 gap-2 py-8">
        <h1>Stick to Day</h1>
        <div className="w-75 h-75 border"></div>
        <h2>Habit Tracker</h2>
      </div>
      <div className="flex flex-col w-75">
        <div className="flex flex-row gap-2 text-sm font-mono mr-auto">
          <button
            className={formState === "login" ? "underline" : "cursor-pointer"}
            onClick={() => setFormState("login")}
          >
            LOGIN
          </button>
          <button
            className={
              formState === "register" ? "underline" : "cursor-pointer"
            }
            onClick={() => setFormState("register")}
          >
            REGISTER
          </button>
        </div>
      </div>
      {formState === "login" ? <LoginForm /> : <SignupForm />}
    </main>
  );
}
