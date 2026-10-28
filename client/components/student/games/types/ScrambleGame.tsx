"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lightbulb, Loader2, RotateCcw, SkipForward, XCircle } from "lucide-react";
import type { GameAnswers, ScrambleConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";

// After this many wrong tries a child may move on, so nobody gets stuck on one word.
const TRIES_BEFORE_SKIP = 2;

export const isScrambleConfig = (config: unknown): config is ScrambleConfig =>
  Array.isArray((config as ScrambleConfig)?.questions) &&
  (config as ScrambleConfig).questions.length > 0 &&
  (config as ScrambleConfig).questions.every((q) => typeof q.id === "string" && Array.isArray(q.letters));

export function ScrambleGame({ config, check, finish, reportProgress, playSound, disabled }: GameComponentProps<ScrambleConfig>) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const [checking, setChecking] = useState(false);
  const [answers, setAnswers] = useState<GameAnswers>({});
  const question = config.questions[questionIndex];
  const word = picked.map((index) => question.letters[index]).join("");

  useEffect(() => reportProgress(questionIndex, config.questions.length), [questionIndex, config.questions.length, reportProgress]);

  const next = (answer: string) => {
    const all = { ...answers, [question.id]: answer };
    setAnswers(all);
    if (questionIndex === config.questions.length - 1) {
      reportProgress(config.questions.length, config.questions.length);
      finish(all);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setPicked([]);
    setFeedback(null);
    setWrongTries(0);
  };

  const submitWord = async () => {
    setChecking(true);
    try {
      const correct = await check(question.id, word);
      setFeedback(correct ? "correct" : "wrong");
      if (correct) window.setTimeout(() => next(word), 650);
      else setWrongTries((tries) => tries + 1);
    } finally {
      setChecking(false);
    }
  };

  const locked = disabled || checking || feedback === "correct";

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          Word {questionIndex + 1} of {config.questions.length}
        </span>
        <span>
          {picked.length}/{question.letters.length} letters
        </span>
      </div>
      <div className="rounded-3xl bg-amber-50 p-5 text-center">
        <p className="text-lg font-bold text-slate-800">Unscramble the word!</p>
        <p className="mt-2 text-slate-600">Hint: {question.hint}</p>
      </div>
      <div
        className="flex min-h-16 flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-200 bg-white p-3"
        aria-label="Your answer"
      >
        {picked.map((letterIndex, position) => (
          <button
            key={`${letterIndex}-${position}`}
            type="button"
            disabled={locked}
            className="min-h-12 min-w-12 rounded-xl bg-amber-400 text-xl font-black text-amber-950"
            onClick={() => {
              playSound("tap");
              setFeedback(null);
              setPicked((items) => items.filter((_, i) => i !== position));
            }}
            aria-label={`Remove ${question.letters[letterIndex]}`}
          >
            {question.letters[letterIndex]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {question.letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            disabled={picked.includes(index) || locked}
            onClick={() => {
              playSound("tap");
              setFeedback(null);
              setPicked((items) => [...items, index]);
            }}
            className="min-h-14 rounded-2xl bg-sky-100 text-2xl font-black text-sky-900 shadow-sm transition motion-safe:active:scale-95 disabled:opacity-35"
          >
            {letter}
          </button>
        ))}
      </div>
      {feedback === "correct" && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-3 font-bold text-emerald-800">
          <CheckCircle2 /> Great job!
        </p>
      )}
      {feedback === "wrong" && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 p-3 font-bold text-rose-800">
          <XCircle /> Try again.
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={locked || !picked.length}
          className="min-h-14 flex-1 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 disabled:opacity-40"
          onClick={() => {
            setPicked([]);
            setFeedback(null);
          }}
        >
          <RotateCcw className="mr-2 inline" size={18} />
          Clear
        </button>
        <button
          type="button"
          disabled={locked || picked.length !== question.letters.length}
          className="min-h-14 flex-1 rounded-2xl bg-emerald-500 font-bold text-white disabled:opacity-40"
          onClick={submitWord}
        >
          {checking ? <Loader2 className="mx-auto animate-spin" /> : "Check"}
        </button>
      </div>
      {wrongTries >= TRIES_BEFORE_SKIP && feedback !== "correct" && (
        <button
          type="button"
          disabled={disabled || checking || picked.length !== question.letters.length}
          onClick={() => next(word)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-slate-600 underline disabled:opacity-40"
        >
          <SkipForward size={16} /> Use my answer and go on
        </button>
      )}
      <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Lightbulb size={16} /> Tap each letter once.
      </p>
    </section>
  );
}
