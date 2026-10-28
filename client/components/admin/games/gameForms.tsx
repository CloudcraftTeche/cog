"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoredAnswerKey, StoredGameConfig } from "@/types/admin/chapterGame.types";
import type { GameType } from "@/types/student/game.types";

// One form per game type. Each converts between the stored config + answer key and simple
// rows an admin or teacher can edit; the server validates the result (gameTypes.ts).

export interface GameForm<S> {
  label: string;
  empty: () => S;
  fromGame: (config: StoredGameConfig, answerKey: StoredAnswerKey | undefined) => S;
  toGame: (state: S) => { config: unknown; answerKey: unknown };
  Fields: (props: { value: S; onChange: (value: S) => void }) => ReactNode;
}

const ids = (prefix: string, count: number) => Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
const answerFor = (answerKey: StoredAnswerKey | undefined, id: string) => {
  const value = answerKey?.[id];
  return typeof value === "string" ? value : "";
};
const words = (text: string) => text.split(",").map((word) => word.trim()).filter(Boolean);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-600">{label}</Label>
      {children}
    </div>
  );
}

// An editable list of rows with add, remove and (optionally) move up/down.
function Rows<T>({
  rows,
  onChange,
  blank,
  addLabel,
  min = 1,
  max = 12,
  movable = false,
  render,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  blank: () => T;
  addLabel: string;
  min?: number;
  max?: number;
  movable?: boolean;
  render: (row: T, update: (row: T) => void, index: number) => ReactNode;
}) {
  const update = (index: number) => (row: T) => onChange(rows.map((item, i) => (i === index ? row : item)));
  const move = (index: number, by: number) => {
    const next = [...rows];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <span className="mt-2 w-6 shrink-0 text-sm font-bold text-gray-500">{index + 1}.</span>
          <div className="flex-1 space-y-2">{render(row, update(index), index)}</div>
          <div className="flex shrink-0 flex-col gap-1">
            {movable && (
              <>
                <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={rows.length <= min}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" disabled={rows.length >= max} onClick={() => onChange([...rows, blank()])}>
        <Plus className="mr-1 h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}

function TrueFalseToggle({ value, onChange }: { value: "true" | "false"; onChange: (value: "true" | "false") => void }) {
  return (
    <div className="flex gap-2">
      {(["true", "false"] as const).map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={value === option ? "default" : "outline"}
          onClick={() => onChange(option)}
          className={value === option ? (option === "true" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700") : ""}
        >
          {option === "true" ? "True" : "Not true"}
        </Button>
      ))}
    </div>
  );
}

interface MemoryVerseForm {
  reference: string;
  text: string;
  rounds: number;
}
const memoryVerse: GameForm<MemoryVerseForm> = {
  label: "Memory Verse",
  empty: () => ({ reference: "", text: "", rounds: 3 }),
  fromGame: (config) => ({ reference: config?.reference ?? "", text: config?.text ?? "", rounds: config?.rounds ?? 3 }),
  toGame: (state) => ({ config: { reference: state.reference.trim(), text: state.text.trim(), rounds: state.rounds }, answerKey: {} }),
  Fields: ({ value, onChange }) => (
    <div className="space-y-3">
      <Field label="Reference (e.g. Psalm 23:1)">
        <Input value={value.reference} onChange={(e) => onChange({ ...value, reference: e.target.value })} />
      </Field>
      <Field label="Verse, exactly as printed in the textbook (2-40 words)">
        <Textarea rows={3} value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} />
      </Field>
      <Field label="Rounds (1-5): each round hides more words, the last hides them all">
        <Input
          type="number"
          min={1}
          max={5}
          value={value.rounds}
          onChange={(e) => onChange({ ...value, rounds: Number(e.target.value) })}
          className="w-24"
        />
      </Field>
    </div>
  ),
};

interface StoryOrderForm {
  prompt: string;
  events: string[];
}
const storyOrder: GameForm<StoryOrderForm> = {
  label: "Story Order",
  empty: () => ({ prompt: "What happened first?", events: ["", "", ""] }),
  fromGame: (config, answerKey) => {
    const byId = new Map<string, string>((config.events ?? []).map((event) => [event.id, event.text ?? ""]));
    const order: string[] = answerKey?.order ?? [...byId.keys()];
    return { prompt: config?.prompt ?? "", events: order.map((id) => byId.get(id) ?? "") };
  },
  toGame: (state) => {
    const eventIds = ids("e", state.events.length);
    return {
      config: {
        prompt: state.prompt.trim() || undefined,
        events: state.events.map((text, index) => ({ id: eventIds[index], text: text.trim() })),
      },
      answerKey: { order: eventIds },
    };
  },
  Fields: ({ value, onChange }) => (
    <div className="space-y-3">
      <Field label="Question shown to the child">
        <Input value={value.prompt} onChange={(e) => onChange({ ...value, prompt: e.target.value })} />
      </Field>
      <Field label="Story events, in the order they happened (3-6). The app shuffles them.">
        <Rows
          rows={value.events}
          onChange={(events) => onChange({ ...value, events })}
          blank={() => ""}
          addLabel="Add event"
          min={3}
          max={6}
          movable
          render={(text, update) => <Input value={text} onChange={(e) => update(e.target.value)} />}
        />
      </Field>
    </div>
  ),
};

interface TrueFalseRow {
  text: string;
  answer: "true" | "false";
  explanation: string;
}
interface TrueFalseForm {
  statements: TrueFalseRow[];
}
const blankStatement = (): TrueFalseRow => ({ text: "", answer: "true", explanation: "" });
const trueFalse: GameForm<TrueFalseForm> = {
  label: "True or Not True",
  empty: () => ({ statements: [blankStatement()] }),
  fromGame: (config, answerKey) => ({
    statements: (config.statements ?? []).map((s): TrueFalseRow => ({
      text: s.text ?? "",
      answer: answerFor(answerKey, s.id) === "false" ? "false" : "true",
      explanation: s.explanation ?? "",
    })),
  }),
  toGame: (state) => {
    const statementIds = ids("s", state.statements.length);
    return {
      config: {
        statements: state.statements.map((s, index) => ({
          id: statementIds[index],
          text: s.text.trim(),
          ...(s.explanation.trim() ? { explanation: s.explanation.trim() } : {}),
        })),
      },
      answerKey: Object.fromEntries(state.statements.map((s, index) => [statementIds[index], s.answer])),
    };
  },
  Fields: ({ value, onChange }) => (
    <Rows
      rows={value.statements}
      onChange={(statements) => onChange({ statements })}
      blank={blankStatement}
      addLabel="Add sentence"
      render={(row, update) => (
        <>
          <Input placeholder="Sentence" value={row.text} onChange={(e) => update({ ...row, text: e.target.value })} />
          <TrueFalseToggle value={row.answer} onChange={(answer) => update({ ...row, answer })} />
          <Input
            placeholder="Explanation shown after answering (optional)"
            value={row.explanation}
            onChange={(e) => update({ ...row, explanation: e.target.value })}
          />
        </>
      )}
    />
  ),
};

interface MissingWordForm {
  sentences: { before: string; answer: string; after: string; explanation: string }[];
  extras: string;
}
const missingWord: GameForm<MissingWordForm> = {
  label: "Missing Word",
  empty: () => ({ sentences: [{ before: "", answer: "", after: "", explanation: "" }], extras: "" }),
  fromGame: (config, answerKey) => {
    const sentences = (config.sentences ?? []).map((s) => ({
      before: s.before ?? "",
      answer: answerFor(answerKey, s.id),
      after: s.after ?? "",
      explanation: s.explanation ?? "",
    }));
    const answers = new Set(sentences.map((s: { answer: string }) => s.answer));
    return { sentences, extras: (config?.bank ?? []).filter((word: string) => !answers.has(word)).join(", ") };
  },
  toGame: (state) => {
    const sentenceIds = ids("m", state.sentences.length);
    const answers = state.sentences.map((s) => s.answer.trim());
    return {
      config: {
        sentences: state.sentences.map((s, index) => ({
          id: sentenceIds[index],
          before: s.before.trim(),
          after: s.after.trim(),
          ...(s.explanation.trim() ? { explanation: s.explanation.trim() } : {}),
        })),
        bank: [...new Set([...answers, ...words(state.extras)])],
      },
      answerKey: Object.fromEntries(answers.map((answer, index) => [sentenceIds[index], answer])),
    };
  },
  Fields: ({ value, onChange }) => (
    <div className="space-y-3">
      <Field label="Sentences (1-8): the text before the gap, the missing word, the text after">
        <Rows
          rows={value.sentences}
          onChange={(sentences) => onChange({ ...value, sentences })}
          blank={() => ({ before: "", answer: "", after: "", explanation: "" })}
          addLabel="Add sentence"
          max={8}
          render={(row, update) => (
            <>
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem_1fr]">
                <Input placeholder="Before the gap" value={row.before} onChange={(e) => update({ ...row, before: e.target.value })} />
                <Input
                  placeholder="Missing word"
                  value={row.answer}
                  onChange={(e) => update({ ...row, answer: e.target.value })}
                  className="border-sky-300 font-semibold"
                />
                <Input placeholder="After the gap" value={row.after} onChange={(e) => update({ ...row, after: e.target.value })} />
              </div>
              <Input
                placeholder="Explanation shown after answering (optional)"
                value={row.explanation}
                onChange={(e) => update({ ...row, explanation: e.target.value })}
              />
            </>
          )}
        />
      </Field>
      <Field label="Extra words for the word bank, comma separated (the missing words are added automatically)">
        <Input value={value.extras} onChange={(e) => onChange({ ...value, extras: e.target.value })} />
      </Field>
    </div>
  ),
};

interface ScrambleForm {
  questions: { hint: string; answer: string }[];
}
const scramble: GameForm<ScrambleForm> = {
  label: "Scrambled Words",
  empty: () => ({ questions: [{ hint: "", answer: "" }] }),
  fromGame: (config, answerKey) => ({
    questions: (config.questions ?? []).map((q) => ({ hint: q.hint ?? "", answer: answerFor(answerKey, q.id) })),
  }),
  toGame: (state) => {
    const questionIds = ids("q", state.questions.length);
    return {
      config: { questions: state.questions.map((q, index) => ({ id: questionIds[index], hint: q.hint.trim() })) },
      answerKey: Object.fromEntries(state.questions.map((q, index) => [questionIds[index], q.answer.trim().toUpperCase()])),
    };
  },
  Fields: ({ value, onChange }) => (
    <Rows
      rows={value.questions}
      onChange={(questions) => onChange({ questions })}
      blank={() => ({ hint: "", answer: "" })}
      addLabel="Add word"
      render={(row, update) => (
        <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
          <Input placeholder="Hint" value={row.hint} onChange={(e) => update({ ...row, hint: e.target.value })} />
          <Input
            placeholder="ONE WORD"
            value={row.answer}
            onChange={(e) => update({ ...row, answer: e.target.value })}
            className="font-semibold uppercase"
          />
        </div>
      )}
    />
  ),
};

interface MatchingForm {
  pairs: { left: string; right: string }[];
}
const matching: GameForm<MatchingForm> = {
  label: "Match the Following",
  empty: () => ({ pairs: [{ left: "", right: "" }, { left: "", right: "" }] }),
  fromGame: (config, answerKey) => {
    const right = new Map<string, string>((config.right ?? []).map((item) => [item.id, item.text ?? ""]));
    return {
      pairs: (config.left ?? []).map((item) => ({ left: item.text ?? "", right: right.get(answerFor(answerKey, item.id)) ?? "" })),
    };
  },
  toGame: (state) => {
    const leftIds = ids("l", state.pairs.length);
    const rightIds = ids("r", state.pairs.length);
    return {
      config: {
        left: state.pairs.map((pair, index) => ({ id: leftIds[index], text: pair.left.trim() })),
        right: state.pairs.map((pair, index) => ({ id: rightIds[index], text: pair.right.trim() })),
      },
      answerKey: Object.fromEntries(leftIds.map((id, index) => [id, rightIds[index]])),
    };
  },
  Fields: ({ value, onChange }) => (
    <Rows
      rows={value.pairs}
      onChange={(pairs) => onChange({ pairs })}
      blank={() => ({ left: "", right: "" })}
      addLabel="Add pair"
      min={2}
      max={6}
      render={(row, update) => (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Left" value={row.left} onChange={(e) => update({ ...row, left: e.target.value })} />
          <Input placeholder="Its match" value={row.right} onChange={(e) => update({ ...row, right: e.target.value })} />
        </div>
      )}
    />
  ),
};

// GameEditor only passes a form's own state back to it, so erasing S here is safe.
const form = <S,>(definition: GameForm<S>) => definition as unknown as GameForm<unknown>;

// Coloring has no form: it can still be published, unpublished or deleted, but not created or edited.
export const GAME_FORMS: Partial<Record<GameType, GameForm<unknown>>> = {
  memory_verse: form(memoryVerse),
  story_order: form(storyOrder),
  true_false: form(trueFalse),
  missing_word: form(missingWord),
  scramble: form(scramble),
  matching: form(matching),
};
