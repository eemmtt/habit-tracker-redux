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
    <>
      <h1>Welcome</h1>
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
      {formState === "login" ? <LoginForm /> : <SignupForm />}
    </>
  );
}
