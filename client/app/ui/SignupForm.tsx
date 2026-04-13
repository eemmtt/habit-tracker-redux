import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

export default function SignupForm({
  handleCompletion,
}: {
  handleCompletion: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.ok) {
      handleCompletion(email);
      setEmail("");
      setEmailConfirmed("");
      setInviteCode("");
    } else {
      setErrorMsg(fetcher.data.msg);
    }
  }, [fetcher.data]);

  return (
    <form
      className="flex flex-col gap-4 w-75 max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (email !== emailConfirmed) {
          setErrorMsg("Emails must match");
          return;
        }

        fetcher.submit(
          {
            intent: "signup",
            email: email,
            invite_code: inviteCode,
          },
          { method: "POST", action: "/welcome" },
        );
      }}
    >
      <div className="flex flex-col font-mono shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] rounded-b">
        <label
          htmlFor="input-email"
          className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5 rounded-t"
        >
          Email:
        </label>
        <input
          className="text-base text-primary focus:outline-none focus:ring-1 focus:ring-inset font-sans bg-card-bg p-2 pt-1 wrap-break-word grow"
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
          htmlFor="input-email-confirm"
          className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5"
        >
          Confirm Email:
        </label>
        <input
          className="text-base text-primary font-sans focus:outline-none focus:ring-1 focus:ring-inset bg-card-bg p-2 pt-1 wrap-break-word grow"
          type="email"
          id="input-email-confirm"
          value={emailConfirmed}
          onChange={(e) => {
            setEmailConfirmed(e.target.value);
          }}
          required
          suppressHydrationWarning
        ></input>
        <label
          htmlFor="input-invite-code"
          className="text-sm font-mono text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5"
        >
          Invite Code:
        </label>
        <input
          className="text-base text-primary font-sans focus:outline-none focus:ring-1 focus:ring-inset bg-card-bg p-2 pt-1 wrap-break-word grow rounded-b"
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
      <div className="flex flex-row">
        {errorMsg && (
          <p className="pl-2 error-msg text-red-600 text-sm">{errorMsg}</p>
        )}
        <button
          type="submit"
          className="ml-auto text-sm cursor-pointer px-1 focus:outline focus:outline-primary"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
