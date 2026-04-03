import type { HabitSummary } from "@shared/types";
import Stat from "./Stat";

// function calcTimeElapsed(interval: HabitInterval, start: string) {
//   const DAY_MS = 1000 * 60 * 60 * 24;
//   const WEEK_MS = DAY_MS * 7;

//   const startDate = new Date(start);
//   const endDate = new Date(); //today
//   const startUTC = Date.UTC(
//     startDate.getFullYear(),
//     startDate.getMonth(),
//     startDate.getDate(),
//   );
//   const endUTC = Date.UTC(
//     endDate.getFullYear(),
//     endDate.getMonth(),
//     endDate.getDate(),
//   );
//   const msPassed = Math.floor(Math.abs(endUTC - startUTC));

//   if (interval === "once-daily" || interval === "twice-daily") {
//     return msPassed / DAY_MS;
//   } else {
//     return msPassed / WEEK_MS;
//   }
// }

export function HabitCard({ data }: { data: HabitSummary }) {
  //   const elapsed = calcTimeElapsed(data.type, data.dateStarted);
  //   const adherence = (data.placedStickers.length / elapsed) * 100;
  //   const nextMs = findNextMS(data.currentStreak);

  const units = data.interval === "weekly" ? "wk" : "d";

  return (
    <div className="w-full h-fit rounded bg-amber-200 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
      <div className="flex flex-row">
        <Stat
          classNames={{ root: "grow", label: "rounded-tl" }}
          label="HABIT DESCRIPTION"
          description={data.description}
        />
        <Stat
          classNames={{ root: "ml-auto", label: "rounded-tr" }}
          label="ADH"
          description={
            // `${adherence.toPrecision(3)}%`
            "100"
          }
        />
      </div>
      <div className="flex flex-row">
        <Stat
          classNames={{ root: "grow" }}
          label="HABIT TYPE"
          description={"data.type"}
        />
        <Stat
          classNames={{ root: "grow" }}
          label="STREAK"
          description={data.current_streak.toString()}
          units={units}
        />
        <Stat
          classNames={{ root: "grow" }}
          label="NEXT MS"
          description={"milestone"}
          units={units}
        />
      </div>
      <div className="grid grid-cols-7 grid-rows-1 items-center w-full gap-2 p-2 bg-background rounded-b">
        <button className="border rounded-full aspect-square">1</button>
        <button className="border rounded-full aspect-square">2</button>
        <button className="border rounded-full aspect-square">3</button>
        <button className="border rounded-full aspect-square">4</button>
        <button className="border rounded-full aspect-square">5</button>
        <button className="border rounded-full aspect-square">6</button>
        <button className="border rounded-full aspect-square">7</button>
      </div>
    </div>
  );
}
