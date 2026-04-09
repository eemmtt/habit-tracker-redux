import LoginForm from "~/ui/LoginForm";
import type { Route } from "./+types/welcome";
import SignupForm from "~/ui/SignupForm";
import { useEffect, useRef, useState } from "react";
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
      if (!res.ok)
        return { ok: false, status: res.status, msg: "Server unavailable" };
      const data = await res.json();
      return { ok: true, status: res.status, res: data };
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
      if (!res.ok)
        return { ok: false, status: res.status, msg: "Server unavailable" };
      const setCookie = res.headers.get("set-cookie");
      return new Response(JSON.stringify({ ok: true, status: res.status }), {
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
      if (!res.ok)
        return { ok: false, status: res.status, msg: "Server unavailable" };
      const data = await res.json();
      return { ok: true, status: res.status, res: data };
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const loginBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (registeredEmail && formState === "login") {
      loginBtnRef.current?.focus();
    }
  }, [formState]);

  function handleCompleteRegistration(email: string) {
    setFormState("login");
    setRegisteredEmail(email);
    setToastMsg("Account created!");
  }

  return (
    <main className="flex flex-col items-center font-mono min-h-screen gap-4 pt-8">
      {toastMsg && (
        <div
          className="absolute txt-sm cursor-pointer border-y animate-[fade-in-dwn_0.5s_ease-in]"
          onClick={() => setToastMsg(null)}
        >
          <p>{toastMsg}</p>
        </div>
      )}
      <div className="flex flex-col items-center w-75 gap-2 py-8">
        <h1>Stick to Day</h1>
        <div className="w-75 h-75 border"></div>
        <h2>Habit Tracker</h2>
      </div>
      <div className="flex flex-col w-75">
        <div className="flex flex-row gap-2 text-sm font-mono mr-auto">
          <button
            className={
              formState === "login"
                ? "underline px-1 focus:outline focus:outline-primary"
                : "cursor-pointer px-1 focus:outline focus:outline-primary"
            }
            onClick={() => setFormState("login")}
          >
            LOGIN
          </button>
          <button
            className={
              formState === "register"
                ? "underline px-1 focus:outline focus:outline-primary"
                : "cursor-pointer px-1 focus:outline focus:outline-primary"
            }
            onClick={() => setFormState("register")}
          >
            REGISTER
          </button>
        </div>
      </div>
      {formState === "login" ? (
        <LoginForm
          loginBtnRef={loginBtnRef}
          initialEmail={registeredEmail ?? undefined}
        />
      ) : (
        <SignupForm handleCompletion={handleCompleteRegistration} />
      )}
    </main>
  );
}
