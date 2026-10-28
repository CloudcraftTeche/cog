import type { GameType } from "@/types/student/game.types";

// A chapter game as staff see it (GET /chapter-games?chapterId=), answer key included.
export type GameStatus = "draft" | "published" | "rejected";

// Stored config and answer key as authored (see server/src/utils/games/gameTypes.ts); each
// game type uses only its own fields.
export interface StoredGameItem {
  id: string;
  text?: string;
  hint?: string;
  before?: string;
  after?: string;
  explanation?: string;
}
export interface StoredGameConfig {
  reference?: string;
  text?: string;
  rounds?: number;
  prompt?: string;
  events?: StoredGameItem[];
  statements?: StoredGameItem[];
  sentences?: StoredGameItem[];
  bank?: string[];
  questions?: StoredGameItem[];
  left?: StoredGameItem[];
  right?: StoredGameItem[];
}
export interface StoredAnswerKey {
  order?: string[];
  [itemId: string]: string | string[] | undefined;
}

export interface StaffChapterGame {
  _id: string;
  chapterId: string;
  gradeId: string;
  key: string;
  type: GameType;
  title: string;
  instructions: string;
  order: number;
  config: StoredGameConfig;
  answerKey?: StoredAnswerKey;
  status: GameStatus;
  source: "manual" | "ai";
  reviewedBy?: string | { _id: string; name?: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameInput {
  type?: GameType;
  title: string;
  instructions: string;
  config: unknown;
  answerKey: unknown;
}

// Textbook lesson shown next to a chapter's games while reviewing (GET /lessons/chapter/:chapterId).
export interface ChapterLesson {
  _id: string;
  lessonNumber: number;
  title: string;
  readingPortion?: string;
  objectives: string[];
  introduction?: string;
  story: string;
  questions: string[];
  memoryVerse: { text: string; reference: string };
  source: { book: string; edition?: string; pages: number[] };
}

export interface ChapterSummary {
  _id: string;
  title: string;
  chapterNumber: number;
  gradeId: { _id: string; grade: string } | string;
}
