/**
 * LOGOS-57: copy the hard-coded Grade 1 activities (client/utils/student/gradeOneActivities.ts
 * and the answer map in the chapter controller) into the ChapterGame collection.
 *
 * Usage: npm run migrate:grade1-games [-- --apply]
 *
 * Insert-only. Games keep their existing ids as `key`, so progress students already
 * have on these activities still counts. Aborts if any target chapter already has games.
 */
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../lib/mongoose";
import { Grade } from "../models/academic/Grade.model";
import { Chapter } from "../models/academic/Chapter.model";
import { ChapterGame } from "../models/academic/ChapterGame.model";
import { User } from "../models/user/User.model";
import { GAME_TYPES, GameType } from "../utils/games/gameTypes";

const GRADE_ID = "69e7e4d999afab19540a389c";

type LegacyActivity =
  | { key: string; type: "scramble"; title: string; instructions: string; questions: { id: string; word: string; hint: string; scrambled?: string }[] }
  | { key: string; type: "matching"; title: string; instructions: string; pairs: { id: string; left: string; right: string }[] }
  | { key: string; type: "coloring"; title: string; instructions: string; imageLabel: string; sections: string[] };

const scramble = (key: string, questions: { word: string; hint: string }[]): LegacyActivity => ({
  key,
  type: "scramble",
  title: "Scrambled Words",
  instructions: "Put the letters in the right order.",
  questions: questions.map((q, i) => ({ id: `${key}-q${i + 1}`, ...q })),
});
const matching = (key: string, pairs: { id: string; left: string; right: string }[]): LegacyActivity => ({
  key,
  type: "matching",
  title: "Match the Following",
  instructions: "Drag each card to its matching answer.",
  pairs,
});
const coloring = (key: string, imageLabel: string, sections: string[]): LegacyActivity => ({
  key,
  type: "coloring",
  title: "Coloring Time",
  instructions: "Color every part of the picture.",
  imageLabel,
  sections,
});

const LEGACY: Record<number, LegacyActivity[]> = {
  1: [scramble("grade-1-chapter-1", [{ word: "LOVE", hint: "God shows this to us." }])],
  2: [matching("grade-1-chapter-2", [
    { id: "god", left: "God", right: "Creator" },
    { id: "adam", left: "Adam", right: "First man" },
  ])],
  3: [coloring("grade-1-chapter-3", "Choose a color for each shape.", ["Heart", "Path", "Sun"])],
  4: [scramble("grade-1-chapter-4", [{ word: "ENOCH", hint: "He walked with God." }])],
  5: [matching("grade-1-chapter-5", [
    { id: "noah", left: "Noah", right: "Ark" },
    { id: "rain", left: "Flood", right: "Rain" },
  ])],
  6: [coloring("grade-1-chapter-6", "Color Abraham’s starry sky.", ["Star", "Tent", "Sky"])],
  7: [scramble("grade-1-chapter-7", [{ word: "LOT", hint: "God cared for him." }])],
  8: [matching("grade-1-chapter-8", [
    { id: "hagar", left: "Hagar", right: "Mother" },
    { id: "help", left: "God", right: "Helper" },
  ])],
  9: [coloring("grade-1-chapter-9", "Color Isaac’s happy picture.", ["Heart", "Mountain", "Sky"])],
  10: [scramble("grade-1-chapter-10", [{ word: "JACOB", hint: "God protected him." }])],
  18: [
    {
      key: "grade-1-chapter-18-scramble",
      type: "scramble",
      title: "Scramble the Words",
      instructions: "Unscramble two Bible words.",
      questions: [
        { id: "grade-1-chapter-18-q1", word: "BABYLON", scrambled: "NOBALBY", hint: "A city where the Israelites were taken captive." },
        { id: "grade-1-chapter-18-q2", word: "FURNACE", scrambled: "NEAFRUC", hint: "A very hot place of fire." },
      ],
    },
    matching("grade-1-chapter-18-matching", [
      { id: "babylon", left: "Babylon", right: "Place where the Israelites were taken captive" },
      { id: "nebuchadnezzar", left: "Nebuchadnezzar", right: "King of Babylon" },
      { id: "three-young-men", left: "Shadrach, Meshach and Abednego", right: "Three young men" },
      { id: "fiery-furnace", left: "Fiery furnace", right: "Place of fire" },
    ]),
  ],
};

// Right-hand ids are random letters so their order does not give away the pairing.
const toGame = (activity: LegacyActivity): { config: any; answerKey?: any } => {
  if (activity.type === "scramble") {
    return {
      config: { questions: activity.questions.map(({ id, hint, scrambled }) => (scrambled ? { id, hint, scrambled } : { id, hint })) },
      answerKey: Object.fromEntries(activity.questions.map((q) => [q.id, q.word])),
    };
  }
  if (activity.type === "matching") {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("").sort(() => Math.random() - 0.5);
    const right = activity.pairs.map((pair, i) => ({ id: `r-${letters[i]}`, text: pair.right }));
    return {
      config: { left: activity.pairs.map((pair) => ({ id: pair.id, text: pair.left })), right },
      answerKey: Object.fromEntries(activity.pairs.map((pair, i) => [pair.id, right[i].id])),
    };
  }
  return { config: { imageLabel: activity.imageLabel, sections: activity.sections } };
};

async function runMigration() {
  const apply = process.argv.includes("--apply");
  await connectToDatabase();
  console.log(`Database host: ${mongoose.connection.host}`);
  console.log(apply ? "Mode: APPLY" : "Mode: dry run (pass --apply to make changes)");

  const grade = await Grade.findById(GRADE_ID).select("grade");
  if (!grade || grade.grade !== "1") throw new Error(`Grade ${GRADE_ID} named "1" not found`);
  const creator = await User.findOne({ role: "superAdmin" }).sort({ createdAt: 1 }).select("_id name email");
  if (!creator) throw new Error("No super admin found to set as game creator");

  const numbers = Object.keys(LEGACY).map(Number);
  const chapters = await Chapter.find({ gradeId: grade._id, chapterNumber: { $in: numbers } }).select("_id chapterNumber title");
  const missing = numbers.filter((n) => !chapters.some((c) => c.chapterNumber === n));
  if (missing.length) throw new Error(`Grade 1 chapters missing: ${missing.join(", ")}`);
  const existing = await ChapterGame.countDocuments({ chapterId: { $in: chapters.map((c) => c._id) } });
  if (existing) throw new Error(`${existing} games already exist on these chapters; nothing was changed`);

  const docs = chapters
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .flatMap((chapter) =>
      LEGACY[chapter.chapterNumber].map((activity, order) => {
        const { config, answerKey } = toGame(activity);
        const error = GAME_TYPES[activity.type as GameType].validate(config, answerKey);
        if (error) throw new Error(`Chapter ${chapter.chapterNumber} ${activity.key}: ${error}`);
        return {
          chapterId: chapter._id as Types.ObjectId,
          gradeId: grade._id,
          key: activity.key,
          type: activity.type,
          title: activity.title,
          instructions: activity.instructions,
          order,
          config,
          answerKey,
          status: "published",
          source: "manual",
          createdBy: creator._id,
          reviewedBy: creator._id,
          reviewedAt: new Date(),
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
        };
      })
    );

  console.log(`\nWill insert ${docs.length} published games (creator ${creator.name} <${creator.email}>):`);
  for (const doc of docs) console.log(`  Chapter ${doc.chapterNumber} "${doc.chapterTitle}": ${doc.type} "${doc.title}" (${doc.key})`);

  if (!apply) {
    console.log("\nDry run complete. Nothing was changed.");
    return;
  }
  const inserted = await ChapterGame.insertMany(docs.map(({ chapterNumber, chapterTitle, ...doc }) => doc));
  console.log(`\nInserted ${inserted.length} games.`);
}

runMigration()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
