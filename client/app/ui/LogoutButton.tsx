import { useFetcher, useNavigate } from "react-router";

export default function LogoutButton() {
  const fetcher = useFetcher();

  return (
    <button
      className="text-sm cursor-pointer w-fit px-1 focus:outline focus:outline-primary"
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
