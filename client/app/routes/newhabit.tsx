import { Suspense, useState } from "react";
import type { Route } from "./+types/newhabit";
import { Await, Link, useLoaderData, useNavigate } from "react-router";
import type { CreateHabitFormData, Habit } from "@shared/types";
import StickerPackSelection from "~/ui/StickerPackSelection";
import type { RouteHandle } from "~/types";

export const handle: RouteHandle = { title: "New Habit", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Habit" },
    { name: "description", content: "Start a new habit" },
  ];
}

async function getStickerPackSummaries(cookie: string) {
  const res = await fetch(`${process.env.API_URL!}api/sticker-packs/summary`, {
    headers: { cookie },
  });
  const data = (await res.json()).data;
  return data;
}

export function loader({ request }: Route.LoaderArgs) {
  return {
    stickerPackSummaries: getStickerPackSummaries(
      request.headers.get("cookie") ?? "",
    ),
  };
}

const url = "api/habits";
type HabitType = { interval: Habit["interval"]; reps: Habit["reps"] };
type HabitTypeKey = keyof typeof HabitTypeLookup;

const HabitTypeLookup = {
  "Once Daily": { interval: "daily", reps: 1 },
  "Twice Daily": {
    interval: "daily",
    reps: 2,
  },
  "Once Weekly": {
    interval: "weekly",
    reps: 1,
  },
} as const satisfies Record<string, HabitType>;

export default function NewHabit() {
  const [habitDescription, setHabitDescription] = useState<string>("");
  const [habitTypeKey, setHabitTypeKey] = useState<HabitTypeKey>(
    Object.keys(HabitTypeLookup)[0] as HabitTypeKey,
  );
  const [stickerPackId, setStickerPackId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { stickerPackSummaries } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  function updateStickerPackId(id: string) {
    setErrorMsg(null);
    setStickerPackId(id);
  }

  return (
    <main className="p-4">
      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={async (e) => {
          e.preventDefault();

          if (stickerPackId === "") {
            setErrorMsg(`Select a Sticker Pack`);
            return;
          }

          const habitType = HabitTypeLookup[habitTypeKey];
          const body: CreateHabitFormData = {
            description: habitDescription,
            interval: habitType.interval,
            reps: habitType.reps,
            current_sticker_pack_id: stickerPackId,
          };
          const result = await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
          });
          if (result.ok) {
            navigate("/");
          } else {
            const response = await result.json();
            setErrorMsg(`${result.status}: ${response.msg}`);
          }
        }}
      >
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <label htmlFor="input-habit-description">Habit Description:</label>
          <textarea
            className="border"
            minLength={8}
            maxLength={72}
            id="input-habit-description"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <label htmlFor="input-habit-type">Habit Type:</label>
          <select
            className="border"
            id="input-habit-type"
            name="habit-type"
            value={habitTypeKey}
            onChange={(e) => setHabitTypeKey(e.target.value as HabitTypeKey)}
            required
          >
            {Object.keys(HabitTypeLookup).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <Suspense fallback={<p>Loading...</p>}>
          <Await resolve={stickerPackSummaries}>
            {(stickerPackSummaries) => (
              <StickerPackSelection
                summaries={stickerPackSummaries}
                handleClick={updateStickerPackId}
              />
            )}
          </Await>
        </Suspense>

        {errorMsg && (
          <p className="error-msg text-red-600 text-sm">{errorMsg}</p>
        )}

        <div className="flex flex-row gap-2 w-full max-w-sm">
          <button type="submit" className="as-btn">
            Create Habit
          </button>
          <Link to="/" className="as-btn">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
