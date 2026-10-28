"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import type { GameAnswers, MemoryVerseConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";
import { ReadAloudButton } from "../primitives/ReadAloudButton";
import { SlotBoard, type Tile } from "../primitives/SlotBoard";

export const isMemoryVerseConfig = (config: unknown): config is MemoryVerseConfig =>
  typeof (config as MemoryVerseConfig)?.reference === "string" &&
  Array.isArray((config as MemoryVerseConfig)?.words) &&
  (config as MemoryVerseConfig).words.length > 1;

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

// Read the verse, then rebuild it over several rounds; each round hides more words and the last hides them all.
// Teachers can shorten the verse for younger children (the game uses whatever verse the game holds).
export function MemoryVerseGame({ config, check, finish, reportProgress, disabled }: GameComponentProps<MemoryVerseConfig>) {
  const rounds = Math.max(1, Math.min(config.rounds || 3, config.words.length));
  const verse = config.words.map((word) => word.text).join(" ");
  // Words disappear in this order, so a hidden word stays hidden in later rounds.
  const hideOrder = useMemo(() => shuffled(config.words.map((word) => word.id)), [config.words]);
  const [round, setRound] = useState(0); // 0 = reading the verse
  const [placed, setPlaced] = useState<Record<string, Tile>>({});
  const [roundDone, setRoundDone] = useState(false);

  const hidden = useMemo(() => {
    if (round === 0) return new Set<string>();
    const count = round === rounds ? config.words.length : Math.max(1, Math.ceil((config.words.length * round) / rounds));
    return new Set(hideOrder.slice(0, count));
  }, [round, rounds, config.words.length, hideOrder]);

  const tiles = useMemo(
    () => shuffled(config.words.filter((word) => hidden.has(word.id)).map((word) => ({ id: `t-${word.id}`, text: word.text }))),
    [config.words, hidden]
  );

  useEffect(() => reportProgress(Math.max(0, round - 1) + (roundDone ? 1 : 0), rounds), [round, roundDone, rounds, reportProgress]);

  const place = async (tile: Tile, slotId: string) => {
    const { correct } = await check(slotId, tile.text);
    if (!correct) return false;
    const next = { ...placed, [slotId]: tile };
    setPlaced(next);
    if (Object.keys(next).length === hidden.size) {
      if (round === rounds) {
        const answers: GameAnswers = Object.fromEntries(Object.entries(next).map(([slot, placedTile]) => [slot, placedTile.text]));
        finish(answers);
      } else {
        setRoundDone(true);
      }
    }
    return true;
  };

  const startRound = (value: number) => {
    setRound(value);
    setPlaced({});
    setRoundDone(false);
  };

  if (round === 0) {
    return (
      <section className="space-y-5 text-center" aria-live="polite">
        <BookOpen className="mx-auto text-amber-500" size={48} aria-hidden />
        <p className="text-lg font-bold text-slate-800">Read the verse out loud.</p>
        <blockquote className="flex items-start gap-3 rounded-3xl bg-amber-50 p-5 text-left text-xl font-bold leading-relaxed text-slate-900">
          <span className="flex-1">
            {verse}
            <span className="mt-2 block text-base font-semibold text-amber-800">{config.reference}</span>
          </span>
          <ReadAloudButton text={`${verse}. ${config.reference}`} label="Read the verse aloud" />
        </blockquote>
        <button
          type="button"
          disabled={disabled}
          onClick={() => startRound(1)}
          className="min-h-14 w-full rounded-2xl bg-sky-600 text-lg font-black text-white disabled:opacity-50"
        >
          I&apos;m ready
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          Round {round} of {rounds}
        </span>
        <span>{config.reference}</span>
      </div>
      <p className="text-center text-lg font-bold text-slate-800">
        {round === rounds ? "Build the whole verse!" : "Put the missing words back."}
      </p>
      <SlotBoard
        layout="inline"
        slots={config.words.map((word) => (hidden.has(word.id) ? { id: word.id } : { id: word.id, fixedText: word.text }))}
        tiles={tiles}
        placed={placed}
        onPlace={place}
        disabled={disabled || roundDone}
      />
      {roundDone && (
        <div className="space-y-3 text-center">
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-3 font-bold text-emerald-800">
            <CheckCircle2 /> Round {round} done!
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => startRound(round + 1)}
            className="min-h-14 w-full rounded-2xl bg-sky-600 text-lg font-black text-white disabled:opacity-50"
          >
            Next round
          </button>
        </div>
      )}
    </section>
  );
}
