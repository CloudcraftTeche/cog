// Game type registry for ChapterGame. Each type defines:
// - validate: checks an author's config + answerKey (returns an error message or null)
// - toStudent: the playable config with every answer removed
// - items: ids a student must answer to finish the game
// - isCorrect: checks one answer against the answer key
// New game types (LOGOS-65) are added here.

export type GameType = "scramble" | "matching" | "coloring" | "memory_verse" | "story_order" | "true_false" | "missing_word";
export type GameAnswers = Record<string, string>;

interface GameTypeDefinition {
  validate: (config: any, answerKey: any) => string | null;
  toStudent: (config: any, answerKey: any) => unknown;
  items: (config: any) => string[];
  isCorrect: (answerKey: any, itemId: string, answer: string, config: any) => boolean;
  // Optional teaching note shown after a child answers (CR-06, LOGOS-142).
  explain?: (config: any, itemId: string) => string | undefined;
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

// Normalises a word for comparison: case and surrounding punctuation do not matter.
const normalizeWord = (word: string) => word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
const verseWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);
const optionalExplanation = (value: unknown) => value === undefined || typeof value === "string";

// config: { reference, text, rounds? }. Each round hides more words; the last hides them all.
// Items are word positions w0..wn; any copy of the right word is accepted ("the" and "the").
const memory_verse: GameTypeDefinition = {
  validate: (config) => {
    if (!isNonEmptyString(config?.reference)) return "Memory verse needs a reference, e.g. John 3:16";
    if (!isNonEmptyString(config?.text)) return "Memory verse needs the verse text";
    const count = verseWords(config.text).length;
    if (count < 2 || count > 40) return "Memory verse must have between 2 and 40 words";
    if (config.rounds !== undefined && (!Number.isInteger(config.rounds) || config.rounds < 1 || config.rounds > 5)) {
      return "Rounds must be a whole number from 1 to 5";
    }
    return null;
  },
  toStudent: (config) => ({
    reference: config.reference,
    rounds: config.rounds ?? 3,
    words: verseWords(config.text).map((text: string, index: number) => ({ id: `w${index}`, text })),
  }),
  items: (config) => verseWords(config.text).map((_: string, index: number) => `w${index}`),
  isCorrect: (_answerKey, itemId, answer, config) => {
    const word = verseWords(config.text)[Number(itemId.slice(1))];
    return word !== undefined && normalizeWord(word) === normalizeWord(answer);
  },
};

// config: { prompt?, events: [{ id, text }] }, answerKey: { order: [eventId, ...] }. Items are slots p1..pn.
const story_order: GameTypeDefinition = {
  validate: (config, answerKey) => {
    const events = config?.events;
    if (!Array.isArray(events) || events.length < 3 || events.length > 6) return "Story order needs 3 to 6 events";
    if (!hasUniqueIds(events) || events.some((e: any) => !isNonEmptyString(e?.id) || !isNonEmptyString(e?.text))) {
      return "Each story event needs a unique id and text";
    }
    const order = answerKey?.order;
    const ids = events.map((e: any) => e.id);
    if (!Array.isArray(order) || order.length !== ids.length || [...order].sort().join() !== [...ids].sort().join()) {
      return "The answer key must list every event exactly once, in story order";
    }
    return null;
  },
  toStudent: (config) => ({ prompt: config.prompt ?? "", events: shuffle(config.events) }),
  items: (config) => config.events.map((_: unknown, index: number) => `p${index + 1}`),
  isCorrect: (answerKey, itemId, answer) => answerKey?.order?.[Number(itemId.slice(1)) - 1] === answer,
};

// config: { statements: [{ id, text, explanation? }] }, answerKey: { [statementId]: "true" | "false" }.
const true_false: GameTypeDefinition = {
  validate: (config, answerKey) => {
    const statements = config?.statements;
    if (!Array.isArray(statements) || !statements.length) return "True or false needs at least one statement";
    if (!hasUniqueIds(statements)) return "Statement ids must be unique";
    for (const statement of statements) {
      if (!isNonEmptyString(statement?.id) || !isNonEmptyString(statement?.text)) return "Each statement needs an id and text";
      if (!optionalExplanation(statement.explanation)) return "Explanation must be text";
      if (answerKey?.[statement.id] !== "true" && answerKey?.[statement.id] !== "false") {
        return `Statement ${statement.id} needs the answer "true" or "false"`;
      }
    }
    return null;
  },
  toStudent: (config) => ({ statements: config.statements.map(({ id, text }: any) => ({ id, text })) }),
  items: (config) => config.statements.map((statement: any) => statement.id),
  isCorrect: (answerKey, itemId, answer) => answerKey?.[itemId] === answer,
  explain: (config, itemId) => config.statements.find((s: any) => s.id === itemId)?.explanation,
};

// config: { sentences: [{ id, before, after, explanation? }], bank: [word] }, answerKey: { [sentenceId]: word }.
const missing_word: GameTypeDefinition = {
  validate: (config, answerKey) => {
    const { sentences, bank } = config ?? {};
    if (!Array.isArray(sentences) || !sentences.length || sentences.length > 8) return "Missing word needs 1 to 8 sentences";
    if (!Array.isArray(bank) || !bank.every(isNonEmptyString) || new Set(bank).size !== bank.length) {
      return "The word bank must be a list of different words";
    }
    if (bank.length < sentences.length) return "The word bank needs at least one word per sentence";
    if (!hasUniqueIds(sentences)) return "Sentence ids must be unique";
    for (const sentence of sentences) {
      if (!isNonEmptyString(sentence?.id) || typeof sentence.before !== "string" || typeof sentence.after !== "string") {
        return "Each sentence needs an id and the text before and after the gap";
      }
      if (!sentence.before.trim() && !sentence.after.trim()) return "A sentence needs words around the gap";
      if (!optionalExplanation(sentence.explanation)) return "Explanation must be text";
      if (!bank.includes(answerKey?.[sentence.id])) return `The answer for ${sentence.id} must be one of the bank words`;
    }
    return null;
  },
  toStudent: (config) => ({
    sentences: config.sentences.map(({ id, before, after }: any) => ({ id, before, after })),
    bank: shuffle(config.bank),
  }),
  items: (config) => config.sentences.map((sentence: any) => sentence.id),
  isCorrect: (answerKey, itemId, answer) => answerKey?.[itemId] === answer,
  explain: (config, itemId) => config.sentences.find((s: any) => s.id === itemId)?.explanation,
};

export const GAME_TYPES: Record<GameType, GameTypeDefinition> = {
  scramble,
  matching,
  coloring,
  memory_verse,
  story_order,
  true_false,
  missing_word,
};

export const isGameType = (type: unknown): type is GameType =>
  typeof type === "string" && Object.prototype.hasOwnProperty.call(GAME_TYPES, type);

// Finishing a game passes it (decided 2026-10-28): every item needs an answer; the score counts correct ones.
export const scoreGame = (type: GameType, config: any, answerKey: any, answers: GameAnswers) => {
  const definition = GAME_TYPES[type];
  const items = definition.items(config);
  const results = items.map((itemId) => ({
    itemId,
    answered: isNonEmptyString(answers?.[itemId]),
    correct: isNonEmptyString(answers?.[itemId]) && definition.isCorrect(answerKey, itemId, answers[itemId], config),
  }));
  return {
    finished: results.every((result) => result.answered),
    score: results.filter((result) => result.correct).length,
    total: items.length,
    results,
  };
};
