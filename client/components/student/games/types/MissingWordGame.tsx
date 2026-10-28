"use client";

import { useEffect, useState } from "react";
import type { MissingWordConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";
import { ReadAloudButton } from "../primitives/ReadAloudButton";
import { SlotBoard, type Tile } from "../primitives/SlotBoard";

export const isMissingWordConfig = (config: unknown): config is MissingWordConfig =>
  Array.isArray((config as MissingWordConfig)?.sentences) &&
  (config as MissingWordConfig).sentences.length > 0 &&
  Array.isArray((config as MissingWordConfig)?.bank);

// Drag (or tap) a word from the word bank into the gap in each sentence.
export function MissingWordGame({ config, check, finish, reportProgress, disabled }: GameComponentProps<MissingWordConfig>) {
  const [placed, setPlaced] = useState<Record<string, Tile>>({});
  const total = config.sentences.length;
  const done = Object.keys(placed).length;
  const tiles = config.bank.map((word) => ({ id: word, text: word }));

  useEffect(() => reportProgress(done, total), [done, total, reportProgress]);

  const place = async (tile: Tile, slotId: string) => {
    const { correct } = await check(slotId, tile.text);
    if (!correct) return false;
    const next = { ...placed, [slotId]: tile };
    setPlaced(next);
    if (Object.keys(next).length === total) {
      finish(Object.fromEntries(Object.entries(next).map(([slot, placedTile]) => [slot, placedTile.text])));
    }
    return true;
  };

  const spoken = config.sentences.map((s) => `${s.before} blank ${s.after}`).join(". ");

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-center gap-3">
        <p className="text-center text-lg font-bold text-slate-800">Fill each gap with a word from the word bank.</p>
        <ReadAloudButton text={`Fill each gap. ${spoken}. The words are: ${config.bank.join(", ")}.`} label="Read the sentences aloud" />
      </div>
      <SlotBoard
        layout="list"
        slots={config.sentences.map((sentence) => ({ id: sentence.id, before: sentence.before, after: sentence.after }))}
        tiles={tiles}
        placed={placed}
        onPlace={place}
        reusableTiles
        disabled={disabled}
        tileLabel="Word bank"
      />
    </section>
  );
}
