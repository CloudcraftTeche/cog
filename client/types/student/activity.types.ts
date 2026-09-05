export type ActivityType = 'scramble' | 'matching' | 'coloring';

export interface ScrambleQuestion {
  id: string;
  word: string;
  hint: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface ColoringActivity {
  imageLabel: string;
  sections: string[];
}

export interface ScrambleActivityConfig {
  type: 'scramble';
  questions: ScrambleQuestion[];
}

export interface MatchingActivityConfig {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ColoringActivityConfig {
  type: 'coloring';
  imageLabel: string;
  sections: string[];
}

export type ActivityConfig =
  | ScrambleActivityConfig
  | MatchingActivityConfig
  | ColoringActivityConfig;

export interface ChapterActivityConfig {
  id: string;
  title: string;
  description: string;
  activity: ActivityConfig;
}

export interface ActivityResult {
  completed: boolean;
  score: number;
  total: number;
  answers: string[];
}