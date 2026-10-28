"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTapOrDrag } from "./useTapOrDrag";

// Put tiles into slots, by dragging or by tap-then-tap. Shared by the memory verse builder,
// story order and missing word games. Each placement is checked by the caller (on the server);
// only correct placements stick, a wrong one flashes the slot.

export interface Slot {
  id: string;
  label?: string; // e.g. "1" for story order
  before?: string; // text shown before the blank (missing word)
  after?: string;
  fixedText?: string; // a word that is already shown (memory verse rounds)
}

export interface Tile {
  id: string;
  text: string;
}

interface Props {
  slots: Slot[];
  tiles: Tile[];
  placed: Record<string, Tile>; // slotId -> tile placed there
  onPlace: (tile: Tile, slotId: string) => Promise<boolean>;
  layout: "inline" | "list";
  reusableTiles?: boolean; // missing word: a bank word can fill more than one gap
  disabled?: boolean;
  tileLabel?: string;
}

export function SlotBoard({ slots, tiles, placed, onPlace, layout, reusableTiles = false, disabled = false, tileLabel = "Words" }: Props) {
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const usedTileIds = new Set(Object.values(placed).map((tile) => tile.id));
  const available = reusableTiles ? tiles : tiles.filter((tile) => !usedTileIds.has(tile.id));

  const drop = async (tileId: string, slotId: string) => {
    const tile = tiles.find((item) => item.id === tileId);
    if (!tile || placed[slotId]) return;
    setChecking(true);
    try {
      const correct = await onPlace(tile, slotId);
      if (!correct) {
        setWrongSlot(slotId);
        window.setTimeout(() => setWrongSlot(null), 700);
      }
    } finally {
      setChecking(false);
    }
  };

  const dnd = useTapOrDrag({ onDrop: drop, disabled: disabled || checking });
  const dragged = tiles.find((tile) => tile.id === dnd.draggingId);

  const blank = (slot: Slot) => {
    const tile = placed[slot.id];
    const isOver = dnd.overId === slot.id;
    const isWrong = wrongSlot === slot.id;
    return (
      <span
        {...dnd.getTargetProps(slot.id, { locked: !!tile })}
        aria-label={tile ? `${tile.text}, correct` : "Empty space"}
        className={`inline-flex min-h-12 min-w-20 items-center justify-center gap-1 rounded-xl border-2 px-3 py-1 align-middle font-bold transition ${
          tile
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : isWrong
              ? "border-rose-400 bg-rose-50 motion-safe:animate-pulse"
              : isOver || dnd.selectedId
                ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                : "border-dashed border-slate-300 bg-slate-50"
        }`}
      >
        {tile ? (
          <>
            <CheckCircle2 size={16} aria-hidden /> {tile.text}
          </>
        ) : (
          " "
        )}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className={layout === "inline" ? "flex flex-wrap items-center gap-2 rounded-3xl bg-amber-50 p-4 text-lg leading-loose" : "space-y-3"}>
        {slots.map((slot) =>
          slot.fixedText !== undefined ? (
            <span key={slot.id} className="px-1 font-bold text-slate-800">
              {slot.fixedText}
            </span>
          ) : layout === "inline" ? (
            <span key={slot.id}>{blank(slot)}</span>
          ) : (
            <div key={slot.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3 text-base text-slate-800">
              {slot.label && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 font-black text-white">{slot.label}</span>
              )}
              {slot.before && <span>{slot.before}</span>}
              {blank(slot)}
              {slot.after && <span>{slot.after}</span>}
            </div>
          )
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-black uppercase tracking-wide text-sky-700">
          <span>{tileLabel}</span>
          {checking && <Loader2 className="animate-spin" size={16} aria-label="Checking" />}
        </div>
        <div className="flex flex-wrap gap-3">
          {available.map((tile) => (
            <div
              key={tile.id}
              {...dnd.getItemProps(tile.id)}
              className={`min-h-14 select-none rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm transition ${
                dnd.selectedId === tile.id
                  ? "border-sky-500 bg-sky-100 text-slate-900 ring-4 ring-sky-200"
                  : dnd.draggingId === tile.id
                    ? "border-sky-300 bg-sky-50 text-slate-400"
                    : "cursor-grab border-slate-200 bg-white text-slate-800"
              }`}
            >
              {tile.text}
            </div>
          ))}
        </div>
      </div>

      {dragged && dnd.dragPosition && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-sky-500 bg-white px-4 py-3 font-bold text-slate-800 shadow-xl"
          style={{ left: dnd.dragPosition.x, top: dnd.dragPosition.y }}
        >
          {dragged.text}
        </div>
      )}
    </div>
  );
}
