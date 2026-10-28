"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import type { GameAnswers, TrueFalseConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";
import { ReadAloudButton } from "../primitives/ReadAloudButton";

export const isTrueFalseConfig = (config: unknown): config is TrueFalseConfig =>
  Array.isArray((config as TrueFalseConfig)?.statements) && (config as TrueFalseConfig).statements.length > 0;

// One statement at a time: thumbs up if it is true, thumbs down if it is not. One try each.
export function TrueFalseGame({ config, check, finish, reportProgress, disabled }: GameComponentProps<TrueFalseConfig>) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<GameAnswers>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string | null } | null>(null);
  const [checking, setChecking] = useState(false);
  const statement = config.statements[index];
  const last = index === config.statements.length - 1;

  useEffect(
    () => reportProgress(index + (feedback ? 1 : 0), config.statements.length),
    [index, feedback, config.statements.length, reportProgress]
  );

  const choose = async (value: "true" | "false") => {
    setChecking(true);
    try {
      const result = await check(statement.id, value);
      setAnswers((items) => ({ ...items, [statement.id]: value }));
      setFeedback(result);
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (last) {
      finish(answers);
      return;
    }
    setIndex((value) => value + 1);
    setFeedback(null);
  };

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="text-sm font-semibold text-slate-600">
        Sentence {index + 1} of {config.statements.length}
      </div>
      <div className="flex items-start gap-3 rounded-3xl bg-amber-50 p-5">
        <p className="flex-1 text-xl font-bold leading-relaxed text-slate-900">{statement.text}</p>
        <ReadAloudButton text={statement.text} label="Read the sentence aloud" />
      </div>
      <p className="text-center text-slate-600">Is this true?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled || checking || !!feedback}
          onClick={() => choose("true")}
          className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl bg-emerald-100 text-lg font-black text-emerald-900 transition motion-safe:active:scale-95 disabled:opacity-50"
        >
          <ThumbsUp size={32} aria-hidden /> True
        </button>
        <button
          type="button"
          disabled={disabled || checking || !!feedback}
          onClick={() => choose("false")}
          className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl bg-rose-100 text-lg font-black text-rose-900 transition motion-safe:active:scale-95 disabled:opacity-50"
        >
          <ThumbsDown size={32} aria-hidden /> Not true
        </button>
      </div>
      {checking && <Loader2 className="mx-auto animate-spin text-sky-600" aria-label="Checking" />}
      {feedback && (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-4 font-bold ${feedback.correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
          >
            <p className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 aria-hidden /> : <XCircle aria-hidden />}
              {feedback.correct ? "That's right!" : "Not quite."}
            </p>
            {feedback.explanation && <p className="mt-2 font-semibold">{feedback.explanation}</p>}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={next}
            className="min-h-14 w-full rounded-2xl bg-sky-600 text-lg font-black text-white disabled:opacity-50"
          >
            {last ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </section>
  );
}
