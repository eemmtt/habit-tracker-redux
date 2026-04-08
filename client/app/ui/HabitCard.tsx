import type {
  HabitSummary,
  StickersByPlacedAt,
  StickerSummary,
} from "@shared/types";
import Stat from "./Stat";
import { useEffect } from "react";
import { dateToStr } from "@shared/helpers";
import { Link, useFetcher } from "react-router";

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
  row_idx,
  placeSticker,
  removeSticker,
}: {
  active: boolean;
  label: number;
  sticker: StickerSummary | undefined;
  date: string;
  row_idx: number;
  placeSticker: (d: string, idx: number) => void;
  removeSticker: (id: string) => void;
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
            className="absolute left-0 top-0 w-full cursor-pointer"
          ></img>
        </div>
      ) : (
        <div
          className="relative"
          id={date}
          onClick={active ? () => placeSticker(date, row_idx) : () => {}}
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
  classes,
  stickers,
  row_idx,
  placeSticker,
  removeSticker,
}: {
  classes: { root: string };
  stickers: StickerSummary[];
  row_idx: number;
  num_rows: number;
  placeSticker: (d: string, idx: number) => void;
  removeSticker: (id: string) => void;
}) {
  const weekDates = getWeekAsArray();
  const today = dateToStr(new Date());

  const classNames =
    "grid grid-cols-7 grid-rows-1 items-center w-full gap-2 bg-background rounded-b";

  return (
    <div
      className={classes.root}
      //   row_idx % 2 === 0
      //     ? classNames + " pl-2 pr-8"
      //     : classNames + " pr-2 pl-8"
      // }
    >
      {weekDates.map((d, idx) => (
        <StickerSpot
          key={d}
          label={idx + 1}
          date={d}
          active={d === today}
          sticker={
            stickers.filter(
              (v) => v.row_idx === row_idx && v.placed_at === d,
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
  data,
  handleUpdate,
}: {
  data: HabitSummary;
  handleUpdate: (h: HabitSummary) => void;
}) {
  const units = data.interval === "weekly" ? "wk" : "d";
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.data) {
      handleUpdate(fetcher.data.data);
    }
  }, [fetcher.data]);

  function placeSticker(date: string, idx: number) {
    fetcher.submit(
      {
        intent: "place",
        habit_id: data.id,
        pack_id: data.current_sticker_pack_id,
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
        habit_id: data.id,
      },
      { method: "POST" },
    );
  }

  const stickerAreaClass =
    "grid grid-cols-7 grid-rows-1 items-center w-full gap-2 bg-background rounded-b";
  const stickerAreaClassSingle = stickerAreaClass + " px-2";
  const stickerAreaClassesMulti = [
    stickerAreaClass + " pl-2 pr-8",
    stickerAreaClass + " pl-8 pr-2",
  ];

  return (
    <div className="w-full max-w-100 h-fit rounded bg-background shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] pb-2">
      <Link to={`habit/${data.id}`}>
        <div className="flex flex-row">
          <Stat
            classNames={{
              root: "grow min-w-0",
              label: "rounded-tl border-r-2 border-background",
            }}
            label="HABIT DESCRIPTION"
            description={data.description}
          />
          <Stat
            classNames={{
              root: "ml-auto",
              label: "rounded-tr",
            }}
            label="ADH"
            description={data.adh}
          />
        </div>
        <div className="flex flex-row">
          <Stat
            classNames={{ root: "grow", label: "border-r-2 border-background" }}
            label="HABIT TYPE"
            description={data.type_str}
          />
          <Stat
            classNames={{ root: "grow", label: "border-r-2 border-background" }}
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
      </Link>
      {Array.from({ length: data.reps }, (_, idx) => idx).map((i) => (
        <StickerArea
          key={i}
          row_idx={i}
          num_rows={data.reps}
          stickers={data.stickers}
          classes={{
            root:
              data.reps === 1
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
