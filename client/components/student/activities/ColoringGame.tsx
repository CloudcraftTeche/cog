"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type {
  ActivityResult,
  ColoringActivityConfig,
} from "@/types/student/activity.types";

interface Props {
  config: ColoringActivityConfig;
  onComplete: (result: ActivityResult) => void;
}
const colors = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#ec4899"];

export function ColoringGame({ config, onComplete }: Props) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const complete = Object.keys(filled).length === config.sections.length;
  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-center text-lg font-bold text-slate-800">
        Tap a color, then tap each shape.
      </p>
      <div className="rounded-3xl bg-sky-50 p-4">
        <svg
          viewBox="0 0 320 250"
          role="img"
          aria-label={config.imageLabel}
          className="mx-auto h-auto w-full max-w-sm"
        >
          <rect x="10" y="10" width="300" height="230" rx="24" fill="#bae6fd" />
          <circle
            cx="160"
            cy="105"
            r="62"
            fill={filled[config.sections[0]] ?? "#e2e8f0"}
            stroke="white"
            strokeWidth="8"
          />
          <path
            d="M45 215 L110 130 L175 215 Z"
            fill={filled[config.sections[1]] ?? "#e2e8f0"}
            stroke="white"
            strokeWidth="8"
          />
          <path
            d="M175 215 L230 145 L290 215 Z"
            fill={filled[config.sections[2]] ?? "#e2e8f0"}
            stroke="white"
            strokeWidth="8"
          />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {config.sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() =>
                setFilled((items) => ({ ...items, [section]: selectedColor }))
              }
              className="min-h-12 rounded-xl bg-white px-2 text-xs font-bold text-slate-700"
            >
              {section}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Choose color ${color}`}
            onClick={() => setSelectedColor(color)}
            className={`min-h-14 min-w-14 rounded-full border-4 border-white shadow-md ${selectedColor === color ? "ring-4 ring-slate-800 ring-offset-2" : ""}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {complete && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-3 font-bold text-emerald-800">
          <CheckCircle2 /> Beautiful coloring!
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          className="min-h-14 flex-1 rounded-2xl border-2 border-slate-200 font-bold text-slate-700"
          onClick={() => setFilled({})}
        >
          <RotateCcw className="mr-2 inline" size={18} />
          Reset
        </button>
        <button
          type="button"
          disabled={!complete}
          className="min-h-14 flex-1 rounded-2xl bg-emerald-500 font-bold text-white disabled:opacity-40"
          onClick={() =>
            onComplete({
              completed: true,
              score: config.sections.length,
              total: config.sections.length,
              answers: config.sections,
            })
          }
        >
          Finish
        </button>
      </div>
    </section>
  );
}
