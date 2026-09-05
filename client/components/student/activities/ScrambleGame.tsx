"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import type {
  ActivityResult,
  ScrambleActivityConfig,
} from "@/types/student/activity.types";

interface Props {
  config: ScrambleActivityConfig;
  onComplete: (result: ActivityResult) => void;
}

export function ScrambleGame({ config, onComplete }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<string[]>([]);
  const [used, setUsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const question = config.questions[questionIndex];
  const letters = useMemo(
    () => question.word.split("").sort(() => Math.random() - 0.5),
    [question],
  );

  const chooseLetter = (index: number) => {
    if (used.includes(index) || feedback) return;
    setUsed((items) => [...items, index]);
    setAnswer((items) => [...items, letters[index]]);
  };

  const check = () => {
    const correct = answer.join("") === question.word;
    setFeedback(correct ? "correct" : "wrong");
    if (!correct) return;
    window.setTimeout(() => {
      if (questionIndex === config.questions.length - 1) {
        onComplete({
          completed: true,
          score: config.questions.length,
          total: config.questions.length,
          answers: config.questions.map((item) => item.word),
        });
      } else {
        setQuestionIndex((index) => index + 1);
        setAnswer([]);
        setUsed([]);
        setFeedback(null);
      }
    }, 650);
  };

  return (
    <section className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          Word {questionIndex + 1} of {config.questions.length}
        </span>
        <span>
          {answer.length}/{question.word.length} letters
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
        {answer.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            className="min-h-12 min-w-12 rounded-xl bg-amber-400 text-xl font-black text-amber-950"
            onClick={() => {
              setAnswer((items) => items.filter((_, i) => i !== index));
              setUsed((items) => items.filter((_, i) => i !== used[index]));
            }}
            aria-label={`Remove ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            disabled={used.includes(index) || !!feedback}
            onClick={() => chooseLetter(index)}
            className="min-h-14 rounded-2xl bg-sky-100 text-2xl font-black text-sky-900 shadow-sm transition active:scale-95 disabled:opacity-35"
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
          className="min-h-14 flex-1 rounded-2xl border-2 border-slate-200 font-bold text-slate-700"
          onClick={() => {
            setAnswer([]);
            setUsed([]);
            setFeedback(null);
          }}
        >
          <RotateCcw className="mr-2 inline" size={18} />
          Clear
        </button>
        <button
          type="button"
          disabled={!answer.length || !!feedback}
          className="min-h-14 flex-1 rounded-2xl bg-emerald-500 font-bold text-white disabled:opacity-40"
          onClick={check}
        >
          Check
        </button>
      </div>
      <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Lightbulb size={16} /> Tap each letter once.
      </p>
    </section>
  );
}
