"use client";

import { useEffect, useState } from "react";
import type { StoryOrderConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";
import { ReadAloudButton } from "../primitives/ReadAloudButton";
import { SlotBoard, type Tile } from "../primitives/SlotBoard";

export const isStoryOrderConfig = (config: unknown): config is StoryOrderConfig =>
  Array.isArray((config as StoryOrderConfig)?.events) && (config as StoryOrderConfig).events.length >= 2;

// Put the story events in the order they happened: first into slot 1, then slot 2, ...
export function StoryOrderGame({ config, check, finish, reportProgress, disabled }: GameComponentProps<StoryOrderConfig>) {
  const [placed, setPlaced] = useState<Record<string, Tile>>({});
  const total = config.events.length;
  const done = Object.keys(placed).length;

  useEffect(() => reportProgress(done, total), [done, total, reportProgress]);

  const place = async (tile: Tile, slotId: string) => {
    const { correct } = await check(slotId, tile.id);
    if (!correct) return false;
    const next = { ...placed, [slotId]: tile };
    setPlaced(next);
    if (Object.keys(next).length === total) {
      finish(Object.fromEntries(Object.entries(next).map(([slot, placedTile]) => [slot, placedTile.id])));
    }
    return true;
  };

  const instructions = config.prompt || "What happened first? Put the story in order.";

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-center gap-3">
        <p className="text-center text-lg font-bold text-slate-800">{instructions}</p>
        <ReadAloudButton
          text={`${instructions} ${config.events.map((event) => event.text).join(". ")}`}
          label="Read the story parts aloud"
        />
      </div>
      <SlotBoard
        layout="list"
        slots={config.events.map((_, index) => ({ id: `p${index + 1}`, label: String(index + 1) }))}
        tiles={config.events}
        placed={placed}
        onPlace={place}
        disabled={disabled}
        tileLabel="Story parts"
      />
    </section>
  );
}
