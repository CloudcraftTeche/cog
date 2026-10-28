"use client";

import { useEffect, useState } from "react";
import { Volume1 } from "lucide-react";
import { canReadAloud, readAloud } from "@/utils/student/readAloud";

// A small speaker button that reads `text` aloud. Hidden on browsers without speech support.
export function ReadAloudButton({ text, label = "Read aloud", className = "" }: { text: string; label?: string; className?: string }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(canReadAloud()), []);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => readAloud(text)}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm ring-1 ring-sky-100 ${className}`}
    >
      <Volume1 size={20} aria-hidden />
    </button>
  );
}
