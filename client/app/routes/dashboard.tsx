import LogoutButton from "~/ui/LogoutButton";
import type { Route } from "./+types/dashboard";
import { Await, Link, useLoaderData } from "react-router";
import type { HabitSummary } from "@shared/types";
import { Suspense } from "react";
import { HabitCard } from "~/ui/HabitCard";
import type { RouteHandle } from "~/types";

export const handle: RouteHandle = { title: "Dashboard" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Sticky Habit Tracker Dashboard" },
  ];
}

async function getHabitSummaries(cookie: string) {
  const res = await fetch(`${process.env.API_URL!}api/habits/summary`, {
    headers: { cookie },
  });
  const data = (await res.json()).data;
  return data;
}

export function loader({ request }: Route.LoaderArgs) {
  return {
    habitSummaries: getHabitSummaries(request.headers.get("cookie") ?? ""),
  };
}

export default function Dashboard() {
  const { habitSummaries } = useLoaderData<typeof loader>();
  return (
    <main className="flex flex-col center">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 p-4">
        <Suspense fallback={<p>Loading...</p>}>
          <Await resolve={habitSummaries}>
            {(habitSummaries) =>
              habitSummaries.map((s: HabitSummary) => (
                <HabitCard key={s.id} data={s} />
              ))
            }
          </Await>
        </Suspense>
      </div>
      <Link to="/new-habit" className="as-btn">
        Start New Habit
      </Link>
    </main>
  );
}
