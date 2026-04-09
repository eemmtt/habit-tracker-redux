import LogoutButton from "~/ui/LogoutButton";
import type { Route } from "./+types/dashboard";
import { Await, Link, redirect, useLoaderData } from "react-router";
import type { HabitSummary } from "@shared/types";
import { Suspense, useState } from "react";
import { HabitCard } from "~/ui/HabitCard";
import type { RouteHandle } from "~/types";

export const handle: RouteHandle = { title: "Home" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Sticki to Day Home" },
  ];
}

async function getHabitSummaries(cookie: string) {
  const res = await fetch(`${process.env.API_URL!}api/habits/summary`, {
    headers: { cookie },
  });
  if (!res.ok) return [];
  const data = (await res.json()).data;
  return data;
}

export function loader({ request }: Route.LoaderArgs) {
  return {
    habitSummaries: getHabitSummaries(request.headers.get("cookie") ?? ""),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const cookie = request.headers.get("cookie") ?? "";

  if (intent === "place") {
    const res = await fetch(`${process.env.API_URL!}api/stickers/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        habit_id: formData.get("habit_id"),
        pack_id: formData.get("pack_id"),
        placed_at: formData.get("placed_at"),
        row_idx: Number(formData.get("row_idx")),
      }),
    });
    return await res.json();
  }

  if (intent === "remove") {
    const res = await fetch(`${process.env.API_URL!}api/stickers/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        id: formData.get("id"),
        habit_id: formData.get("habit_id"),
      }),
    });
    return await res.json();
  }
}

function HabitList({ summaries }: { summaries: HabitSummary[] }) {
  const [habitSummaries, setHabitSummaries] =
    useState<HabitSummary[]>(summaries);

  function updateHabits(updatedSummary: HabitSummary) {
    setHabitSummaries((prev) =>
      prev.map((s) => (s.id === updatedSummary.id ? updatedSummary : s)),
    );
  }

  return (
    <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 p-4 pt-2">
      {habitSummaries.map((s: HabitSummary) => (
        <HabitCard key={s.id} data={s} handleUpdate={updateHabits} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { habitSummaries } = useLoaderData<typeof loader>();
  return (
    <main className="flex flex-col items-center pb-32">
      <Suspense fallback={<p>Loading...</p>}>
        <Await resolve={habitSummaries}>
          {(habitSummaries) => <HabitList summaries={habitSummaries} />}
        </Await>
      </Suspense>
      <Link
        to="/new-habit"
        className="text-sm cursor-pointer w-fit px-1 focus:outline focus:outline-primary"
      >
        START NEW HABIT
      </Link>
    </main>
  );
}
