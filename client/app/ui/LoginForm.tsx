import { useState } from "react";
import { useNavigate } from "react-router";

const requestCodeUrl = "/api/auth/request-code";
const verifyCodeUrl = "/api/auth/verify-code";

export default function LoginForm() {
  const [form, setForm] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (form === "request") {
          const options = {
            method: "POST",
            body: JSON.stringify({
              email: email,
            }),
          };
          const response = await fetch(requestCodeUrl, options);
          if (response.status === 409) {
            navigate("/");
          }
          if (response.ok) {
            setForm("verify");
          }
        } else {
          const options = {
            method: "POST",
            body: JSON.stringify({
              email: email,
              code: code,
            }),
          };
          const response = await fetch(verifyCodeUrl, options);
          if (response.ok || response.status === 409) {
            navigate("/");
          }
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
          ></input>
        </div>
      )}
      {errorMsg && <p className="error-msg text-red-600 text-sm">{errorMsg}</p>}
      <button type="submit">
        {form === "request" ? "Send Verification Code" : "Login"}
      </button>
    </form>
  );
}
