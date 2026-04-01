import LogoutButton from "~/ui/LogoutButton";
import type { Route } from "./+types/dashboard";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Sticky Habit Tracker Dashboard" },
  ];
}

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <LogoutButton />
      <Link to="/new-habit" className="as-btn">
        Start New Habit
      </Link>
    </>
  );
}
