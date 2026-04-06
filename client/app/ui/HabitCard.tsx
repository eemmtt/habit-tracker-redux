import type {
  HabitSummary,
  StickersByPlacedAt,
  StickerSummary,
} from "@shared/types";
import Stat from "./Stat";
import { act, useState } from "react";
import { dateToStr } from "@shared/helpers";
import { useRevalidator } from "react-router";

function getWeekAsArray() {
  const today = new Date();
  const monday = new Date(
    today.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1),
    ),
  );

  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return dateToStr(date);
  });

  return currentWeek;
}

function StickerSpot({
  active,
  label,
  sticker,
  date,
  placeSticker,
  removeSticker,
}: {
  active: boolean;
  label: number;
  sticker: StickerSummary | undefined;
  date: string;
  placeSticker: (d: string) => Promise<void>;
  removeSticker: (id: string) => Promise<void>;
}) {
  const buttonClassesActive =
    "border rounded-full aspect-square w-full cursor-pointer hover:bg-amber-50";
  const buttonClassesInActive =
    "border rounded-full aspect-square w-full border-inactive text-inactive";

  return (
    <>
      {sticker ? (
        <div
          className="relative"
          id={date}
          onClick={() => removeSticker(sticker.sticker_placed_id)}
        >
          <button
            className={active ? buttonClassesActive : buttonClassesInActive}
          >
            {label}
          </button>
          <img
            src={sticker.imageUrl ? sticker.imageUrl + "_256px.webp" : ""}
            alt={sticker.sticker_name}
            className="absolute left-0 top-0 w-16 h-16 cursor-pointer"
          ></img>
        </div>
      ) : (
        <div
          className="relative"
          id={date}
          onClick={active ? () => placeSticker(date) : () => {}}
        >
          <button
            className={active ? buttonClassesActive : buttonClassesInActive}
          >
            {label}
          </button>
        </div>
      )}
    </>
  );
}

function StickerArea({
  stickers,
  placeSticker,
  removeSticker,
}: {
  stickers: StickersByPlacedAt;
  placeSticker: (d: string) => Promise<void>;
  removeSticker: (id: string) => Promise<void>;
}) {
  const weekDates = getWeekAsArray();
  const today = dateToStr(new Date());

  return (
    <div className="grid grid-cols-7 grid-rows-1 items-center w-full gap-2 p-2 bg-background rounded-b">
      {weekDates.map((d, idx) => (
        <StickerSpot
          key={d}
          label={idx}
          date={d}
          active={d === today}
          sticker={stickers.get(d)}
          placeSticker={placeSticker}
          removeSticker={removeSticker}
        />
      ))}
    </div>
  );
}

export function HabitCard({ data }: { data: HabitSummary }) {
  const { revalidate } = useRevalidator();

  const units = data.interval === "weekly" ? "wk" : "d";
  const stickersByPlacedAt: StickersByPlacedAt = new Map(
    data.stickers.map(({ placed_at, ...i }) => [
      placed_at,
      { placed_at, ...i },
    ]),
  );

  async function placeSticker(d: string) {
    const body = JSON.stringify({
      habit_id: data.id,
      pack_id: data.current_sticker_pack_id,
      placed_at: d,
    });

    const res = await fetch("/api/stickers/place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (res.ok) {
      revalidate();
    }
  }

  async function removeSticker(id: string) {
    console.log("remove sticker", id);
    const body = JSON.stringify({
      id: id,
    });

    const res = await fetch("/api/stickers/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (res.ok) {
      revalidate();
    } else {
      const body = await res.json();
      console.log(body.msg);
    }
  }

  return (
    <div className="w-full max-w-100 h-fit rounded bg-amber-200 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
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
          description={data.type_str}
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
          description={data.next_ms}
        />
      </div>
      <StickerArea
        stickers={stickersByPlacedAt}
        placeSticker={placeSticker}
        removeSticker={removeSticker}
      />
    </div>
  );
}
