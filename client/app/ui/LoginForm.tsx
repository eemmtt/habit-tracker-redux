import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

const requestCodeUrl = "/api/auth/request-code";
const verifyCodeUrl = "/api/auth/verify-code";

export default function LoginForm() {
  const [form, setForm] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      const data = fetcher.data.res.json();
      setErrorMsg(data.msg);
    }
  }, [fetcher.data]);

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-sm"
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
      <div className="flex flex-col gap-1">
        <label htmlFor="input-email" className="text-sm font-medium">
          Email:
        </label>
        <input
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
      {form === "verify" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="input-verification-code"
            className="text-sm font-medium"
          >
            Verification Code:
          </label>
          <input
            type="text"
            id="input-verification-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            required
            suppressHydrationWarning
          ></input>
        </div>
      )}
      {errorMsg && <p className="error-msg text-red-600 text-sm">{errorMsg}</p>}
      <button type="submit" className="as-btn">
        {form === "request" ? "Send Verification Code" : "Login"}
      </button>
    </form>
  );
}
