import type { RouteHandle } from "~/types";
import { redirect, useFetcher, useParams } from "react-router";
import type { Route } from "./+types/habit";

export const handle: RouteHandle = { title: "Habit Details", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Habit Details" },
    { name: "description", content: "Habit details" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const cookie = request.headers.get("cookie") ?? "";

  if (intent === "delete-habit") {
    const habit_id = formData.get("habit_id") ?? "";
    const rest = await fetch(
      `${process.env.API_URL}api/habits/${habit_id}/delete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
        body: "",
      },
    );
    if (rest.ok) return redirect("/");
  }
}

export default function Habit() {
  const { id } = useParams();
  const fetcher = useFetcher();
  return (
    <main className="p-4">
      <h1>{id}</h1>
      <p>Todo: display habit details</p>
      <button
        className="text-sm cursor-pointer w-fit px-1 focus:outline focus:outline-primary"
        onClick={async (e) => {
          e.preventDefault();
          fetcher.submit(
            { intent: "delete-habit", habit_id: id ?? "" },
            { method: "POST" },
          );
        }}
      >
        Delete Habit
      </button>
    </main>
  );
}
