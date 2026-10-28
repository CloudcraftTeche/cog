"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type { ColoringConfig } from "@/types/student/game.types";
import type { GameComponentProps } from "../registry";

const colors = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#ec4899"];
// The picture has three shapes; the first three sections colour them, any more are buttons only.
const SHAPE_COUNT = 3;

export const isColoringConfig = (config: unknown): config is ColoringConfig =>
  typeof (config as ColoringConfig)?.imageLabel === "string" &&
  Array.isArray((config as ColoringConfig)?.sections) &&
  (config as ColoringConfig).sections.length > 0;

export function ColoringGame({ config, finish, reportProgress, playSound, disabled }: GameComponentProps<ColoringConfig>) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const done = config.sections.filter((section) => filled[section]).length;
  const complete = done === config.sections.length;
  const shapeFill = (index: number) => (index < SHAPE_COUNT && filled[config.sections[index]]) || "#e2e8f0";

  useEffect(() => reportProgress(done, config.sections.length), [done, config.sections.length, reportProgress]);

  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-center text-lg font-bold text-slate-800">Tap a color, then tap each shape.</p>
      <div className="rounded-3xl bg-sky-50 p-4">
        <svg viewBox="0 0 320 250" role="img" aria-label={config.imageLabel} className="mx-auto h-auto w-full max-w-sm">
          <rect x="10" y="10" width="300" height="230" rx="24" fill="#bae6fd" />
          <circle cx="160" cy="105" r="62" fill={shapeFill(0)} stroke="white" strokeWidth="8" />
          <path d="M45 215 L110 130 L175 215 Z" fill={shapeFill(1)} stroke="white" strokeWidth="8" />
          <path d="M175 215 L230 145 L290 215 Z" fill={shapeFill(2)} stroke="white" strokeWidth="8" />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {config.sections.map((section) => (
            <button
              key={section}
              type="button"
              disabled={disabled}
              onClick={() => {
                playSound("tap");
                setFilled((items) => ({ ...items, [section]: selectedColor }));
              }}
              className="min-h-12 rounded-xl border-4 bg-white px-2 text-xs font-bold text-slate-700"
              style={{ borderColor: filled[section] ?? "white" }}
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
            aria-pressed={selectedColor === color}
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
          disabled={disabled}
          className="min-h-14 flex-1 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 disabled:opacity-40"
          onClick={() => setFilled({})}
        >
          <RotateCcw className="mr-2 inline" size={18} />
          Reset
        </button>
        <button
          type="button"
          disabled={!complete || disabled}
          className="min-h-14 flex-1 rounded-2xl bg-emerald-500 font-bold text-white disabled:opacity-40"
          onClick={() => finish(filled)}
        >
          Finish
        </button>
      </div>
    </section>
  );
}
