// lib/constants/teacher-chapter.constants.ts

export const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export const CHAPTERS = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));

export const GRADE_COLORS = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-indigo-500 via-blue-500 to-cyan-500",
] as const;

export const UNIT_COLORS = [
  "from-purple-400 to-pink-400",
  "from-blue-400 to-cyan-400",
  "from-green-400 to-emerald-400",
  "from-orange-400 to-red-400",
  "from-rose-400 to-pink-400",
  "from-indigo-400 to-purple-400",
] as const;

export const CARD_GRADIENT_COLORS = [
  "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600",
  "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600",
  "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600",
  "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600",
] as const;