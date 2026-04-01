import { useState } from "react";
import { useNavigate } from "react-router";

const url = "/api/auth/signup";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

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

        const options = {
          method: "POST",
          body: JSON.stringify({
            email: email,
            invite_code: inviteCode,
          }),
        };
        const response = await fetch(url, options);
        if (response.ok) {
          setEmail("");
          setEmailConfirmed("");
          setInviteCode("");
          navigate("/");
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
        ></input>
      </div>
      {errorMsg && <p className="error-msg text-red-600 text-sm">{errorMsg}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
