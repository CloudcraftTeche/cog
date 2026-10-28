// Game type registry for ChapterGame. Each type defines:
// - validate: checks an author's config + answerKey (returns an error message or null)
// - toStudent: the playable config with every answer removed
// - items: ids a student must answer to finish the game
// - isCorrect: checks one answer against the answer key
// New game types (LOGOS-65) are added here.

export type GameType = "scramble" | "matching" | "coloring";
export type GameAnswers = Record<string, string>;

interface GameTypeDefinition {
  validate: (config: any, answerKey: any) => string | null;
  toStudent: (config: any, answerKey: any) => unknown;
  items: (config: any) => string[];
  isCorrect: (answerKey: any, itemId: string, answer: string) => boolean;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasUniqueIds = (list: { id: string }[]) => new Set(list.map((item) => item.id)).size === list.length;

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const scrambleLetters = (word: string): string[] => {
  const letters = word.split("");
  if (new Set(letters).size < 2) return letters;
  let shuffled = shuffle(letters);
  while (shuffled.join("") === word) shuffled = shuffle(letters);
  return shuffled;
};

// config: { questions: [{ id, hint, scrambled? }] }, answerKey: { [questionId]: WORD }
const scramble: GameTypeDefinition = {
  validate: (config, answerKey) => {
    const questions = config?.questions;
    if (!Array.isArray(questions) || !questions.length) return "Scramble needs at least one question";
    if (!hasUniqueIds(questions)) return "Scramble question ids must be unique";
    for (const question of questions) {
      if (!isNonEmptyString(question?.id) || !isNonEmptyString(question?.hint)) {
        return "Each scramble question needs an id and a hint";
      }
      const word = answerKey?.[question.id];
      if (!isNonEmptyString(word) || !/^[A-Za-z]+$/.test(word)) {
        return `Scramble question ${question.id} needs a one-word answer using letters only`;
      }
      if (
        question.scrambled !== undefined &&
        question.scrambled.toUpperCase().split("").sort().join("") !== word.toUpperCase().split("").sort().join("")
      ) {
        return `Scrambled letters for ${question.id} do not match the answer`;
      }
    }
    return null;
  },
  toStudent: (config, answerKey) => ({
    questions: config.questions.map((question: any) => ({
      id: question.id,
      hint: question.hint,
      letters: question.scrambled
        ? question.scrambled.toUpperCase().split("")
        : scrambleLetters(String(answerKey[question.id]).toUpperCase()),
    })),
  }),
  items: (config) => config.questions.map((question: any) => question.id),
  isCorrect: (answerKey, itemId, answer) =>
    String(answerKey?.[itemId] ?? "").toUpperCase() === String(answer).trim().toUpperCase(),
};

// config: { left: [{ id, text }], right: [{ id, text }] }, answerKey: { [leftId]: rightId }
const matching: GameTypeDefinition = {
  validate: (config, answerKey) => {
    const { left, right } = config ?? {};
    if (!Array.isArray(left) || !Array.isArray(right) || left.length < 2) {
      return "Matching needs at least two pairs";
    }
    if (left.length !== right.length) return "Matching needs the same number of items on each side";
    if (!hasUniqueIds(left) || !hasUniqueIds(right)) return "Matching ids must be unique on each side";
    if ([...left, ...right].some((item: any) => !isNonEmptyString(item?.id) || !isNonEmptyString(item?.text))) {
      return "Each matching item needs an id and text";
    }
    const rightIds = new Set(right.map((item: any) => item.id));
    const targets = left.map((item: any) => answerKey?.[item.id]);
    if (targets.some((target: unknown) => !rightIds.has(target as string)) || new Set(targets).size !== targets.length) {
      return "The answer key must match every left item to a different right item";
    }
    return null;
  },
  toStudent: (config) => ({ left: shuffle(config.left), right: shuffle(config.right) }),
  items: (config) => config.left.map((item: any) => item.id),
  isCorrect: (answerKey, itemId, answer) => answerKey?.[itemId] === answer,
};

// config: { imageLabel, sections: [name] }; no answer key, any colour counts.
const coloring: GameTypeDefinition = {
  validate: (config) => {
    if (!isNonEmptyString(config?.imageLabel)) return "Coloring needs an image label";
    if (!Array.isArray(config.sections) || !config.sections.length || !config.sections.every(isNonEmptyString)) {
      return "Coloring needs at least one section name";
    }
    if (new Set(config.sections).size !== config.sections.length) return "Coloring section names must be unique";
    return null;
  },
  toStudent: (config) => ({ imageLabel: config.imageLabel, sections: config.sections }),
  items: (config) => config.sections,
  isCorrect: (_answerKey, _itemId, answer) => isNonEmptyString(answer),
};

export const GAME_TYPES: Record<GameType, GameTypeDefinition> = { scramble, matching, coloring };

export const isGameType = (type: unknown): type is GameType =>
  typeof type === "string" && Object.prototype.hasOwnProperty.call(GAME_TYPES, type);

// Finishing a game passes it (decided 2026-10-28): every item needs an answer; the score counts correct ones.
export const scoreGame = (type: GameType, config: any, answerKey: any, answers: GameAnswers) => {
  const definition = GAME_TYPES[type];
  const items = definition.items(config);
  const results = items.map((itemId) => ({
    itemId,
    answered: isNonEmptyString(answers?.[itemId]),
    correct: isNonEmptyString(answers?.[itemId]) && definition.isCorrect(answerKey, itemId, answers[itemId]),
  }));
  return {
    finished: results.every((result) => result.answered),
    score: results.filter((result) => result.correct).length,
    total: items.length,
    results,
  };
};
