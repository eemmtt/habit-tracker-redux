import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetcher = useFetcher();

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.ok) {
      setEmail("");
      setEmailConfirmed("");
      setInviteCode("");
      navigate("/");
    }
  }, [fetcher.data]);

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (email !== emailConfirmed) {
          setErrorMsg("Emails must match");
          return;
        }

        fetcher.submit({
          intent: "signup",
          email: email,
          invite_code: inviteCode,
        }, { method: "POST", action: "/welcome" });
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
      <div className="flex flex-col gap-1">
        <label htmlFor="input-email-confirm" className="text-sm font-medium">
          Confirm Email:
        </label>
        <input
          type="email"
          id="input-email-confirm"
          value={emailConfirmed}
          onChange={(e) => {
            setEmailConfirmed(e.target.value);
          }}
          required
          suppressHydrationWarning
        ></input>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="input-invite-code" className="text-sm font-medium">
          Invite Code:
        </label>
        <input
          type="text"
          id="input-invite-code"
          value={inviteCode}
          onChange={(e) => {
            setInviteCode(e.target.value);
          }}
          required
          suppressHydrationWarning
        ></input>
      </div>
      {errorMsg && <p className="error-msg text-red-600 text-sm">{errorMsg}</p>}
      <button type="submit" className="as-btn">
        Submit
      </button>
    </form>
  );
}
