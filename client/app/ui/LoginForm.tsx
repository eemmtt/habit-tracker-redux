import React, { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

export default function LoginForm({
  loginBtnRef,
  initialEmail,
}: {
  loginBtnRef: React.RefObject<HTMLButtonElement | null>;
  initialEmail?: string;
}) {
  const [form, setForm] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const fetcher = useFetcher();

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.status === 409) {
      navigate("/");
    } else if (fetcher.data.ok) {
      if (form === "request") {
        setForm("verify");
      } else if (form === "verify") {
        navigate("/");
      }
    } else {
      setErrorMsg(fetcher.data.msg);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (form === "verify") {
      codeInputRef.current?.focus();
    }
  }, [form]);

  return (
    <form
      className="flex flex-col gap-4 w-75 max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (form === "request") {
          fetcher.submit(
            {
              intent: "request",
              email: email,
            },
            { method: "POST", action: "/welcome" },
          );
        } else if (form === "verify") {
          fetcher.submit(
            {
              intent: "verify",
              email: email,
              code: code,
            },
            { method: "POST", action: "/welcome" },
          );
        }
      }}
    >
      {form === "request" ? (
        <div className="flex flex-col font-mono shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] rounded-b">
          <label
            htmlFor="input-email"
            className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5 rounded-t"
          >
            Email:
          </label>
          <input
            className="text-base text-primary font-sans focus:outline-none focus:ring-1 focus:ring-inset bg-card-bg p-2 pt-1 wrap-break-word grow rounded-b"
            type="email"
            id="input-email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            suppressHydrationWarning
          ></input>
        </div>
      ) : (
        <div className="flex flex-col font-mono shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] rounded-b">
          <label
            htmlFor="input-email"
            className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5 rounded-t"
          >
            Email:
          </label>
          <input
            className="text-base text-primary font-sans focus:outline-none focus:ring-1 focus:ring-inset bg-card-bg p-2 pt-1 wrap-break-word grow"
            type="email"
            id="input-email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            suppressHydrationWarning
          ></input>
          <label
            htmlFor="input-verification-code"
            className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5"
          >
            Verification Code:
          </label>
          <input
            className="text-base text-primary font-sans focus:outline-none focus:ring-1 focus:ring-inset bg-card-bg p-2 pt-1 wrap-break-word grow rounded-b"
            type="text"
            id="input-verification-code"
            value={code}
            ref={codeInputRef}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            required
            suppressHydrationWarning
          ></input>
        </div>
      )}
      <div className="flex flex-row">
        {errorMsg && (
          <p className="pl-2 error-msg text-red-600 text-sm">{errorMsg}</p>
        )}
        <button
          type="submit"
          ref={loginBtnRef}
          className="ml-auto text-sm cursor-pointer px-1 focus:outline focus:outline-primary"
        >
          {form === "request" ? "Send Verification Code" : "Continue"}
        </button>
      </div>
    </form>
  );
}
