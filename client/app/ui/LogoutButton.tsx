import { useFetcher, useNavigate } from "react-router";

export default function LogoutButton() {
  const fetcher = useFetcher();

  return (
    <button
      className="as-btn"
      onClick={async (e) => {
        e.preventDefault();
        fetcher.submit(
          { intent: "logout" },
          { method: "POST", action: "/welcome" },
        );
      }}
    >
      Logout
    </button>
  );
}
