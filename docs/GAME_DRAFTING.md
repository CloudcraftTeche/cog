# Drafting chapter games in Claude Code

Games for Grades 1–5 are drafted from the textbook lessons in Claude Code (on the
admin's own Claude subscription, no API key), loaded into the app as **unpublished
drafts**, and only reach students after an admin, super admin or the grade's teacher
approves them.

```
cog-textbooks/grade-1.lessons.json   (from npm run extract:lessons, outside the repo)
        │  Claude Code reads a few lessons, follows this guide
        ▼
cog-textbooks/grade-1.games.json     (drafts, outside the repo)
        │  npm run load:games -- … (dry run, then --apply)
        ▼
ChapterGame  status: draft, source: ai  →  review and approve  →  published
```

## Keep the textbook private

- Lesson text and drafted games live in `cog-textbooks/` next to the repo, never inside it. `load:games` refuses a file inside the repository, and `.gitignore` blocks `*.pdf`, `*.lessons.json` and `cog-textbooks/`.
- Don't paste lesson text into commits, PRs, Jira or docs. Talk about a lesson by its number and title.
- Games quote the textbook only as much as a game needs (a verse, a short sentence), never whole paragraphs.

## Asking Claude Code for drafts

Work a unit (5–7 chapters) at a time so each batch is easy to review, for example:

> Read docs/GAME_DRAFTING.md. Draft games for Grade 1 lessons 1–6 from
> ../cog-textbooks/grade-1.lessons.json and add them to ../cog-textbooks/grade-1.games.json.
> Then run the load:games dry run.

For each chapter, draft **3 games**:

1. a `memory_verse` with the lesson's memory verse;
2. one game about the story, either `story_order` or `true_false`;
3. one word game, either `missing_word`, `scramble` or `matching`.

Vary the types from chapter to chapter so it doesn't feel repetitive. Every published game has to be finished before the chapter is complete, so don't go above 3 games per chapter for Grade 1.

## Content rules

- **Only what the lesson says.** Every fact, name, event and answer comes from that chapter's lesson: its story, reading portion or memory verse. Never add details from elsewhere in the Bible, and never write an answer that contradicts the lesson.
- **Memory verse exactly as printed.** Copy `memoryVerse.text` and `memoryVerse.reference` unchanged, including wording and punctuation. `load:games` rejects a verse that differs from the lesson. Over 40 words is too long; leave that chapter's verse game out and say so.
- **Reading level:**
  - Grade 1–2: sentences of 3–8 words, everyday words, names as the lesson spells them.
  - Grade 3–5: up to about 15 words.
  - Use present-day words (no "thee", "thou") except inside the verse.
- **Kind and simple.** No trick questions, double negatives or "all of the above". For `true_false`, false statements change one clear thing ("Noah built a **car**"), never a subtle detail.
- **Explanations** (optional, on `true_false` and `missing_word`): one short sentence a child understands, taken from the lesson, e.g. "God kept Daniel safe from the lions."
- **No personal data, links or images.** All games are text-only for now.

## File format

```json
{
  "grade": "1",
  "chapters": [
    {
      "chapterNumber": 1,
      "games": [
        {
          "key": "ai-memory-verse",
          "type": "memory_verse",
          "title": "Learn the verse",
          "instructions": "Read the verse, then put the missing words back.",
          "config": { "reference": "…", "text": "…", "rounds": 3 },
          "answerKey": {}
        }
      ]
    }
  ]
}
```

- **`grade`:** the grade's name in the app, e.g. `"1"`.
- **`chapterNumber`:** the lesson number, since Grade 1 chapters are numbered like the lessons.
- **`key`:** lowercase with dashes, unique within the chapter, starting with `ai-`, e.g. `ai-memory-verse`, `ai-story-order`. The key records a student's result, so don't change it once the game is published.
- **`title`:** shown to the child, 2–4 words.
- **`instructions`:** one sentence, read aloud by the speaker button.
- **`answerKey`:** stays on the server and is never sent to students.

## Game types

Ids inside a game (`s1`, `e1`, `l1`, …) only need to be unique within that game. The examples use public-domain Bible text (KJV), not textbook text.

### `memory_verse`: rebuild the verse

```json
"config": { "reference": "Psalm 23:1", "text": "The LORD is my shepherd; I shall not want.", "rounds": 3 },
"answerKey": {}
```
- **Words:** 2–40.
- **Rounds:** 1–5, default 3. Each round hides more words, and the last hides them all.
  - Grade 1: 3 rounds for up to 12 words, 2 rounds for longer verses.
  - Grade 2–5: 3–4 rounds.

### `story_order`: put the story in order

```json
"config": {
  "prompt": "What happened first?",
  "events": [
    { "id": "e1", "text": "God told Noah to build an ark." },
    { "id": "e2", "text": "The animals went into the ark." },
    { "id": "e3", "text": "It rained for forty days." },
    { "id": "e4", "text": "God put a rainbow in the sky." }
  ]
},
"answerKey": { "order": ["e1", "e2", "e3", "e4"] }
```
- **Events:** 3–6, each a short sentence; Grade 1 uses 3–4.
- **Answer key:** every event id once, in story order. The app shuffles the events.
- **Clear order:** pick events that come clearly one after another.

### `true_false`: thumbs up or thumbs down

```json
"config": {
  "statements": [
    { "id": "s1", "text": "Noah built an ark.", "explanation": "God told Noah to build a big boat called an ark." },
    { "id": "s2", "text": "Noah built a car." }
  ]
},
"answerKey": { "s1": "true", "s2": "false" }
```
- **Statements:** 4–6, with a mix of true and false, not all one way.
- **Answers:** the strings `"true"` or `"false"`.

### `missing_word`: fill the gap from a word bank

```json
"config": {
  "sentences": [
    { "id": "m1", "before": "God told Noah to build an", "after": "." },
    { "id": "m2", "before": "The", "after": "came after the rain.", "explanation": "The rainbow was God's promise." }
  ],
  "bank": ["ark", "rainbow", "tent", "river"]
},
"answerKey": { "m1": "ark", "m2": "rainbow" }
```
- **Sentences:** 1–8; Grade 1 uses 3–4.
- **Gap:** exactly one word.
- **Bank:** all different words, at least one per sentence. Add 1–2 extra words that fit the story but not the gaps.
- **Answer key:** each answer is spelled exactly as in the bank.

### `scramble`: unscramble the word

```json
"config": {
  "questions": [
    { "id": "q1", "hint": "The boat Noah built" },
    { "id": "q2", "hint": "God's promise in the sky" }
  ]
},
"answerKey": { "q1": "ARK", "q2": "RAINBOW" }
```
- **Answers:** one word, letters only, 3–8 letters for Grade 1. The app scrambles the letters.
- **Questions:** 3–5, each with a hint a child can answer from the lesson.

### `matching`: match the pairs

```json
"config": {
  "left": [
    { "id": "l1", "text": "Noah" },
    { "id": "l2", "text": "Ark" },
    { "id": "l3", "text": "Rainbow" }
  ],
  "right": [
    { "id": "r1", "text": "Obeyed God" },
    { "id": "r2", "text": "A big boat" },
    { "id": "r3", "text": "God's promise" }
  ]
},
"answerKey": { "l1": "r1", "l2": "r2", "l3": "r3" }
```
- **Pairs:** 3–5, the same number on each side.
- **Answer key:** each left id maps to a different right id.

`coloring` is not drafted, because it doesn't test anything from the lesson.

## Loading the drafts

Run from `server/`:

```bash
# Dry run: checks every game and shows what would be added; changes nothing
npm run load:games -- ../../cog-textbooks/grade-1.games.json --by <admin email>

# Load them as drafts
npm run load:games -- ../../cog-textbooks/grade-1.games.json --by <admin email> --apply
```

- **Same rules as the app:** every game is checked with the server's rules for its type (`server/src/utils/games/gameTypes.ts`) and the memory-verse check above. If anything is wrong, nothing is loaded and every problem is listed.
- **Drafts only:** games go in with `status: draft` and `source: ai`, after the chapter's existing games. Students never see drafts.
- **Existing keys are skipped:** a game whose `key` already exists in its chapter is not loaded. With `--replace-drafts`, an existing AI draft with that key is replaced by the new version, which helps when redrafting after review. Published (approved) and rejected games are never changed.
- **Database:** the script uses `MONGO_URI` from `server/.env` and prints the database host first. Check it before `--apply`.

## Reviewing

An admin, a super admin, or the grade's teacher opens each draft and checks it against the lesson. They fix or reject anything wrong, then publish. In the app: **Chapters → a chapter's Games button**. The textbook lesson is on the left and the games on the right, each with Preview, Edit, Approve, Reject and Delete.

**Publishing to a chapter students have already finished:** students who already completed the chapter keep their completion. The new game appears for them to play, but it doesn't affect their result. Students who haven't finished must play it too. Draft and publish before a chapter goes live.
