"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type {
  ActivityResult,
  MatchingActivityConfig,
} from "@/types/student/activity.types";

interface Props {
  config: MatchingActivityConfig;
  onComplete: (result: ActivityResult) => void;
}

export function MatchingGame({ config, onComplete }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const pickRight = (id: string) => {
    if (!selectedLeft || matched.includes(id)) return;
    if (selectedLeft === id) {
      const next = [...matched, id];
      setMatched(next);
      setSelectedLeft(null);
      setWrong(false);
      if (next.length === config.pairs.length)
        onComplete({
          completed: true,
          score: next.length,
          total: next.length,
          answers: next,
        });
    } else {
      setWrong(true);
      setSelectedLeft(null);
      window.setTimeout(() => setWrong(false), 700);
    }
  };
  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-center text-lg font-bold text-slate-800">
        Tap a card, then tap its match.
      </p>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          {matched.length} of {config.pairs.length} matched
        </span>
        <span>Keep going!</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {config.pairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              disabled={matched.includes(pair.id)}
              onClick={() => setSelectedLeft(pair.id)}
              className={`min-h-20 w-full rounded-2xl border-2 p-3 text-base font-bold transition ${matched.includes(pair.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : selectedLeft === pair.id ? "border-sky-500 bg-sky-100 text-sky-900" : "border-slate-200 bg-white text-slate-800"}`}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {config.pairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              disabled={matched.includes(pair.id)}
              onClick={() => pickRight(pair.id)}
              className={`min-h-20 w-full rounded-2xl border-2 p-3 text-base font-bold transition ${matched.includes(pair.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-800"}`}
            >
              {pair.right}
            </button>
          ))}
        </div>
      </div>
      {matched.length === config.pairs.length && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-3 font-bold text-emerald-800">
          <CheckCircle2 /> All matched!
        </p>
      )}
      {wrong && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 p-3 font-bold text-rose-800">
          <XCircle /> That pair is not right.
        </p>
      )}
    </section>
  );
}
