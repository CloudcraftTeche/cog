"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, GripVertical, Loader2, XCircle } from "lucide-react";
import type { MatchingConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";
import { useTapOrDrag } from "../primitives/useTapOrDrag";

export const isMatchingConfig = (config: unknown): config is MatchingConfig =>
  Array.isArray((config as MatchingConfig)?.left) &&
  Array.isArray((config as MatchingConfig)?.right) &&
  (config as MatchingConfig).left.length > 0;

export function MatchingGame({ config, check, finish, reportProgress, disabled }: GameComponentProps<MatchingConfig>) {
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const matchedRight = new Set(Object.values(matched));
  const total = config.left.length;
  const done = Object.keys(matched).length;

  useEffect(() => reportProgress(done, total), [done, total, reportProgress]);

  const tryMatch = async (leftId: string, rightId: string) => {
    if (matched[leftId] || matchedRight.has(rightId)) return;
    setChecking(true);
    try {
      const { correct } = await check(leftId, rightId);
      if (!correct) {
        setWrongTarget(rightId);
        window.setTimeout(() => setWrongTarget(null), 700);
        return;
      }
      const next = { ...matched, [leftId]: rightId };
      setMatched(next);
      if (Object.keys(next).length === total) finish(next);
    } finally {
      setChecking(false);
    }
  };

  const dnd = useTapOrDrag({ onDrop: tryMatch, disabled: disabled || checking });
  const dragged = config.left.find((item) => item.id === dnd.draggingId);

  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-center text-lg font-bold text-slate-800">Drag each word to its match, or tap a word and then its match.</p>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          {done} of {total} matched
        </span>
        {checking && <Loader2 className="animate-spin text-sky-600" size={18} aria-label="Checking" />}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-black uppercase tracking-wide text-sky-700">Words</p>
          {config.left.map((item) => {
            const isMatched = !!matched[item.id];
            const isSelected = dnd.selectedId === item.id;
            return (
              <div
                key={item.id}
                {...dnd.getItemProps(item.id, { locked: isMatched })}
                className={`flex min-h-20 select-none items-center gap-2 rounded-2xl border-2 p-4 text-base font-bold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : isSelected
                      ? "border-sky-500 bg-sky-100 text-slate-800 ring-4 ring-sky-200"
                      : dnd.draggingId === item.id
                        ? "border-sky-300 bg-sky-50 text-slate-400"
                        : "cursor-grab border-slate-200 bg-white text-slate-800 shadow-sm"
                }`}
              >
                {isMatched ? <CheckCircle2 className="shrink-0" aria-hidden /> : <GripVertical className="shrink-0 text-sky-500" aria-hidden />}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Answers</p>
          {config.right.map((item) => {
            const isMatched = matchedRight.has(item.id);
            const isOver = dnd.overId === item.id;
            const isWrong = wrongTarget === item.id;
            return (
              <div
                key={item.id}
                {...dnd.getTargetProps(item.id, { locked: isMatched })}
                className={`flex min-h-20 items-center rounded-2xl border-2 p-4 text-sm font-bold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : isWrong
                      ? "border-rose-400 bg-rose-50 text-rose-800 motion-safe:animate-pulse"
                      : isOver || dnd.selectedId
                        ? "border-sky-500 bg-sky-50 text-slate-800 ring-2 ring-sky-200"
                        : "border-dashed border-slate-300 bg-slate-50 text-slate-800"
                }`}
              >
                {isMatched && <CheckCircle2 className="mr-2 shrink-0 text-emerald-600" aria-hidden />}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      {wrongTarget && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 p-3 font-bold text-rose-800">
          <XCircle /> That match is not right. Try again.
        </p>
      )}
      {dragged && dnd.dragPosition && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-sky-500 bg-white px-4 py-3 font-bold text-slate-800 shadow-xl"
          style={{ left: dnd.dragPosition.x, top: dnd.dragPosition.y }}
        >
          {dragged.text}
        </div>
      )}
    </section>
  );
}
