import type { HabitSummary, HabitWeek, StickerSummary } from "@shared/types";
import Stat from "./Stat";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

const STICKER_SPOT_ACTIVE =
  "border border-primary text-primary font-mono text-xs rounded-full aspect-square w-full cursor-pointer";
const STICKER_SPOT_DISABLED =
  "border rounded-full aspect-square w-full border-inactive text-inactive font-mono text-xs";

function StickerSpot({
  active,
  label,
  sticker,
  date,
  row_idx,
  placeSticker,
  removeSticker,
}: {
  active: boolean;
  label: string;
  sticker: StickerSummary | undefined;
  date: string;
  row_idx: number;
  placeSticker: (d: string, idx: number) => void;
  removeSticker: (id: string) => void;
}) {
  return (
    <>
      {sticker ? (
        <div
          className="relative"
          id={date}
          onClick={(e) => {
            e.stopPropagation();
            removeSticker(sticker.sticker_placed_id);
          }}
        >
          <button
            className={active ? STICKER_SPOT_ACTIVE : STICKER_SPOT_DISABLED}
          >
            {label}
          </button>
          <img
            src={sticker.imageUrl ? sticker.imageUrl + "_256px.webp" : ""}
            alt={sticker.sticker_name}
            className="absolute left-0 top-0 w-full cursor-pointer"
          ></img>
        </div>
      ) : (
        <div
          className="relative"
          id={date}
          onClick={(e) => {
            e.stopPropagation();
            placeSticker(date, row_idx);
          }}
        >
          <button
            className={active ? STICKER_SPOT_ACTIVE : STICKER_SPOT_DISABLED}
          >
            {label}
          </button>
        </div>
      )}
    </>
  );
}

function StickerArea({
  classes,
  time,
  stickers,
  row_idx,
  disabled,
  placeSticker,
  removeSticker,
}: {
  classes: { root: string };
  time: HabitWeek;
  stickers: StickerSummary[];
  row_idx: number;
  disabled: boolean;
  placeSticker: (d: string, idx: number) => void;
  removeSticker: (id: string) => void;
}) {
  // const weekDates = getWeekAsArray();
  // const today = dateToStr(new Date());

  return (
    <div className={classes.root}>
      {time.days.map((d) => (
        <StickerSpot
          key={d.date}
          label={d.label}
          date={d.date}
          active={!disabled && d.date === time.today}
          sticker={
            stickers.filter(
              (v) => v.row_idx === row_idx && v.placed_at === d.date,
            )[0]
          }
          row_idx={row_idx}
          placeSticker={placeSticker}
          removeSticker={removeSticker}
        />
      ))}
    </div>
  );
}

export function HabitCard({
  summary,
  time,
  handleUpdate,
}: {
  summary: HabitSummary;
  time: HabitWeek;
  handleUpdate: (h: HabitSummary) => void;
}) {
  const cardRootRef = useRef<HTMLDivElement | null>(null);
  const units = summary.interval === "weekly" ? "wk" : "d";
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.data) {
      handleUpdate(fetcher.data.data);
    }
  }, [fetcher.data]);

  function placeSticker(date: string, idx: number) {
    fetcher.submit(
      {
        intent: "place",
        habit_id: summary.id,
        pack_id: summary.current_sticker_pack_id,
        placed_at: date,
        row_idx: idx,
      },
      { method: "POST" },
    );
  }

  function removeSticker(id: string) {
    fetcher.submit(
      {
        intent: "remove",
        id,
        habit_id: summary.id,
      },
      { method: "POST" },
    );
  }

  const stickerAreaClass =
    "grid grid-cols-7 grid-rows-1 items-center w-full gap-2 bg-card-bg rounded-b";
  const stickerAreaClassSingle = stickerAreaClass + " px-2";
  const stickerAreaClassesMulti = [
    stickerAreaClass + " pl-2 pr-8",
    stickerAreaClass + " pl-8 pr-2",
  ];

  return (
    <div
      role="link"
      tabIndex={0}
      ref={cardRootRef}
      onClick={(e) => {
        if (typeof e.target !== typeof HTMLButtonElement) {
          navigate(`habit/${summary.id}`);
        } else {
          e.preventDefault();
        }
      }}
      className="w-full max-w-100 h-fit rounded bg-card-bg shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] pb-2 focus:outline focus:outline-primary"
    >
      {/* <Link to={`habit/${data.id}`}> */}
      <div className="flex flex-row">
        <Stat
          classNames={{
            root: "grow min-w-0",
            label: "rounded-tl border-r-2 border-card-bg",
            description: "font-sans",
          }}
          label="HABIT DESCRIPTION"
          description={summary.description}
        />
        <Stat
          classNames={{
            root: "ml-auto",
            label: "rounded-tr",
          }}
          label="ADH"
          description={summary.adh}
        />
      </div>
      <div className="flex flex-row">
        <Stat
          classNames={{ root: "grow", label: "border-r-2 border-card-bg" }}
          label="HABIT TYPE"
          description={summary.type_str}
        />
        <Stat
          classNames={{ root: "grow", label: "border-r-2 border-card-bg" }}
          label="STREAK"
          description={summary.current_streak.toString()}
          units={units}
        />
        <Stat
          classNames={{ root: "grow" }}
          label="NEXT MS"
          description={summary.next_ms}
        />
      </div>
      {/* </Link> */}
      {Array.from({ length: summary.reps }, (_, idx) => idx).map((i) => (
        <StickerArea
          key={i}
          time={time}
          row_idx={i}
          stickers={summary.stickers}
          disabled={fetcher.state !== "idle"}
          classes={{
            root:
              summary.reps === 1
                ? stickerAreaClassSingle
                : stickerAreaClassesMulti[i % 2],
          }}
          placeSticker={placeSticker}
          removeSticker={removeSticker}
        />
      ))}
    </div>
  );
}
