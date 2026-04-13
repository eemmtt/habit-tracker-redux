import { Suspense, useEffect, useState } from "react";
import type { Route } from "./+types/newhabit";
import {
  Await,
  data,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";
import type { CreateHabitFormData, Habit } from "@shared/types";
import StickerPackSelection from "~/ui/StickerPackSelection";
import type { FetchReturn, RouteHandle } from "~/types";

export const handle: RouteHandle = { title: "New Habit", parent: "/" };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Habit" },
    { name: "description", content: "Start a new habit" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const cookie = request.headers.get("cookie") ?? "";

  if (intent === "create-habit") {
    const res = await fetch(`${process.env.API_URL!}habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        description: formData.get("description"),
        interval: formData.get("interval"),
        reps: Number(formData.get("reps")),
        current_sticker_pack_id: formData.get("current_sticker_pack_id"),
      }),
    });
    let out: FetchReturn;
    if (!res.ok) {
      out = {
        ok: false,
        status: res.status,
        msg: "Failed to create habit",
      };
      return data(out);
    }

    const obj = await res.json();
    out = { ok: res.ok, status: res.status, msg: "Habit created", data: obj };
    return data(out);
  }
}

async function getStickerPackSummaries(cookie: string) {
  const res = await fetch(`${process.env.API_URL!}sticker-packs/summary`, {
    headers: { cookie },
  });
  if (!res.ok) return null;
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
  const fetcher = useFetcher();

  function updateStickerPackId(id: string) {
    setErrorMsg(null);
    setStickerPackId(id);
  }

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.ok) {
      navigate("/");
    } else {
      setErrorMsg(`${fetcher.data.status}: ${fetcher.data.msg}`);
    }
  }, [fetcher.data]);

  return (
    <main className="p-4 font-mono">
      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={async (e) => {
          e.preventDefault();

          if (stickerPackId === "") {
            setErrorMsg(`Select a Sticker Pack`);
            return;
          }

          const habitType = HabitTypeLookup[habitTypeKey];
          fetcher.submit(
            {
              intent: "create-habit",
              description: habitDescription,
              interval: habitType.interval,
              reps: habitType.reps,
              current_sticker_pack_id: stickerPackId,
            },
            { method: "POST" },
          );
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
                summaries={stickerPackSummaries ?? []}
                handleClick={updateStickerPackId}
              />
            )}
          </Await>
        </Suspense>

        {errorMsg && (
          <p className="error-msg text-red-600 text-sm">{errorMsg}</p>
        )}

        <div className="flex flex-row gap-2 w-full max-w-sm">
          <button
            type="submit"
            className="text-sm cursor-pointer w-fit px-1 focus:outline focus:outline-primary"
          >
            Create Habit
          </button>
          <Link
            to="/"
            className="text-sm cursor-pointer w-fit px-1 focus:outline focus:outline-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
