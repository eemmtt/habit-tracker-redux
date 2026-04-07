import LoginForm from "~/ui/LoginForm";
import type { Route } from "./+types/welcome";
import SignupForm from "~/ui/SignupForm";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome" },
    { name: "description", content: "Sticky Habit Tracker Login" },
  ];
}

export default function Welcome() {
  const [formState, setFormState] = useState<"login" | "register">("login");
  return (
    <main className="flex flex-col items-center min-h-screen gap-4 pt-8">
      <h1>STICKY</h1>
      <div className="w-75 h-75 border"></div>
      <h2>Habit Tracker</h2>
      <div className="flex flex-row">
        <button
          className={formState === "login" ? "as-btn selected" : "as-btn"}
          onClick={() => setFormState("login")}
        >
          Login
        </button>
        <button
          className={formState === "register" ? "as-btn selected" : "as-btn"}
          onClick={() => setFormState("register")}
        >
          Register
        </button>
      </div>
      {formState === "login" ? <LoginForm /> : <SignupForm />}
    </main>
  );
}
