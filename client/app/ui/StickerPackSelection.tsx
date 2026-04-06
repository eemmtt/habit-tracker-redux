import type { StickerPackSummary } from "@shared/types";
import { useState } from "react";

export default function StickerPackSelection({
  summaries,
  handleClick,
}: {
  summaries: StickerPackSummary[];
  handleClick: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState("");

  const liClasses = "border p-1 hover:bg-amber-50 cursor-pointer";
  const selected = " bg-amber-100";

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <h1>Sticker Pack</h1>
      <ul className="flex flex-col gap-2">
        {summaries.map((s) => (
          <li
            className={s.id === selectedId ? liClasses + selected : liClasses}
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(s.id);
              handleClick(s.id);
            }}
          >
            <h2>{s.name}</h2>
            <ul className="flex flex-row gap-2">
              {s.stickers.map((sticker) => (
                <img
                  key={sticker.sticker_id}
                  className="w-16 h-16"
                  src={sticker.imageUrl + "_256px.webp"}
                  alt={sticker.sticker_name}
                ></img>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
