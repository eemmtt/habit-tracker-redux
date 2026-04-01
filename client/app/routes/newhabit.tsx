import { useState } from "react";
import type { Route } from "./+types/newhabit";
import { Link, useNavigate } from "react-router";
import type { Habit } from "@shared/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Habit" },
    { name: "description", content: "Start a new habit" },
  ];
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
  const [habitDescription, setHabitDescription] = useState("");
  const [habitTypeKey, setHabitTypeKey] = useState<HabitTypeKey>(
    Object.keys(HabitTypeLookup)[0] as HabitTypeKey,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-lg">New Habit</h1>
      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={async (e) => {
          e.preventDefault();

          const habitType = HabitTypeLookup[habitTypeKey];
          const result = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              description: habitDescription,
              interval: habitType.interval,
              reps: habitType.reps,
              stickerpack_id: -1, //TODO: implement sticker pack selection
            }),
          });
          if (result.ok) {
            navigate("/");
          } else {
            setErrorMsg(`${result.status}: ${result.statusText}`);
          }
        }}
      >
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <label htmlFor="input-habit-description">Habit Description:</label>
          <textarea
            className="border"
            minLength={8}
            maxLength={255}
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
              <option value={key}>{key}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <p>Sticker Pack</p>
          {/* TODO: implement sticker pack selection */}
        </div>
        {errorMsg && (
          <p className="error-msg text-red-600 text-sm">{errorMsg}</p>
        )}

        <div className="flex flex-row gap-2 w-full max-w-sm">
          <button type="submit">Create Habit</button>
          <Link to="/" className="as-btn">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
