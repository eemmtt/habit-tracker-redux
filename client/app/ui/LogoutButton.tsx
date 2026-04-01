import { useNavigate } from "react-router";

const url = "/api/auth/logout";

export default function LogoutButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        const options = {
          method: "POST",
          body: "",
        };
        const response = await fetch(url, options);
        if (response.ok || response.status === 401) {
          navigate("/welcome");
        }
      }}
    >
      Logout
    </button>
  );
}
