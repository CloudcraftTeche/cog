// Chapter games as served by GET /chapter-games/chapter/:chapterId/play (answers removed).
export type GameType = 'scramble' | 'matching' | 'coloring';

export interface ScrambleConfig {
  questions: { id: string; hint: string; letters: string[] }[];
}

export interface MatchingConfig {
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
}

export interface ColoringConfig {
  imageLabel: string;
  sections: string[];
}

export interface GameResult {
  score: number;
  total: number;
  completedAt?: string;
}

export interface PlayableGame<C = unknown> {
  _id: string;
  key: string;
  type: GameType | string;
  title: string;
  instructions: string;
  order: number;
  config: C;
  result: GameResult | null;
}

export type GameAnswers = Record<string, string>;

export interface SubmitGameResponse {
  gameId: string;
  score: number;
  total: number;
  results: { itemId: string; correct: boolean }[];
  chapterCompleted: boolean;
  chapterStatus: string;
}
