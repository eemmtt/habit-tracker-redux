import type { RouteHandle } from "~/types";
import { useParams } from "react-router";
import type { Route } from "./+types/habit";

export const handle: RouteHandle = { title: "Habit Details", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Habit Details" },
    { name: "description", content: "Habit details" },
  ];
}

export default function Habit() {
  const { id } = useParams();
  return (
    <main className="p-4">
      <h1>{id}</h1>
      <p>Todo: display habit details</p>
    </main>
  );
}
