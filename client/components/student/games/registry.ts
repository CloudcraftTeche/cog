import type { ComponentType } from "react";
import type { CheckResult, GameAnswers, GameType } from "@/types/student/game.types";
import type { GameSound } from "@/utils/student/gameSounds";
import { ScrambleGame, isScrambleConfig } from "./types/ScrambleGame";
import { MatchingGame, isMatchingConfig } from "./types/MatchingGame";
import { ColoringGame, isColoringConfig } from "./types/ColoringGame";
import { MemoryVerseGame, isMemoryVerseConfig } from "./types/MemoryVerseGame";
import { StoryOrderGame, isStoryOrderConfig } from "./types/StoryOrderGame";
import { TrueFalseGame, isTrueFalseConfig } from "./types/TrueFalseGame";
import { MissingWordGame, isMissingWordConfig } from "./types/MissingWordGame";

// What every game component receives from the shared GameShell.
export interface GameComponentProps<C> {
  config: C;
  // Asks the server whether one item (a word, a pair) is right. Plays the matching sound.
  check: (itemId: string, answer: string) => Promise<CheckResult>;
  // Called once every item has an answer; the shell submits it and shows the result.
  finish: (answers: GameAnswers) => void;
  reportProgress: (done: number, total: number) => void;
  playSound: (sound: GameSound) => void;
  disabled: boolean;
}

export interface GamePlugin<C> {
  type: GameType;
  label: string;
  // Guards against malformed data so a bad game shows a message instead of crashing the page.
  isValidConfig: (config: unknown) => config is C;
  Component: ComponentType<GameComponentProps<C>>;
}

// The shell only renders a plugin after its isValidConfig guard passes, so erasing C here is safe.
const register = <C,>(plugin: GamePlugin<C>) => plugin as unknown as GamePlugin<unknown>;

// Add new game types (LOGOS-65) here: a component plus its config guard.
export const GAME_REGISTRY: Record<GameType, GamePlugin<unknown>> = {
  scramble: register({ type: "scramble", label: "Scrambled Words", isValidConfig: isScrambleConfig, Component: ScrambleGame }),
  matching: register({ type: "matching", label: "Match the Following", isValidConfig: isMatchingConfig, Component: MatchingGame }),
  coloring: register({ type: "coloring", label: "Coloring Time", isValidConfig: isColoringConfig, Component: ColoringGame }),
  memory_verse: register({ type: "memory_verse", label: "Memory Verse", isValidConfig: isMemoryVerseConfig, Component: MemoryVerseGame }),
  story_order: register({ type: "story_order", label: "Story Order", isValidConfig: isStoryOrderConfig, Component: StoryOrderGame }),
  true_false: register({ type: "true_false", label: "True or Not True", isValidConfig: isTrueFalseConfig, Component: TrueFalseGame }),
  missing_word: register({ type: "missing_word", label: "Missing Word", isValidConfig: isMissingWordConfig, Component: MissingWordGame }),
};

export const getGamePlugin = (type: string): GamePlugin<unknown> | null =>
  (GAME_REGISTRY as Record<string, GamePlugin<unknown>>)[type] ?? null;
