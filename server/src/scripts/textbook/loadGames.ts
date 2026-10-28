/**
 * Loads games drafted in Claude Code (docs/GAME_DRAFTING.md) into ChapterGame as
 * unpublished drafts (status "draft", source "ai") for an admin to review.
 *
 * Usage: npm run load:games -- <grade-1.games.json> --by <admin email> [--apply] [--replace-drafts]
 *
 * Without --apply it is a dry run. Every game is checked with the same rules the API
 * uses; if any game is invalid nothing is changed. A game whose key already exists in
 * its chapter is skipped. With --replace-drafts, an existing AI draft with that key is
 * replaced; published and rejected games are never touched.
 */
import fs from "fs";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../../lib/mongoose";
import { Grade } from "../../models/academic/Grade.model";
import { Chapter } from "../../models/academic/Chapter.model";
import { Lesson } from "../../models/academic/Lesson.model";
import { ChapterGame } from "../../models/academic/ChapterGame.model";
import { User } from "../../models/user/User.model";
import { GAME_TYPES, GameType, isGameType } from "../../utils/games/gameTypes";
import { assertOutsideRepo } from "./outsideRepo";

// Types Claude may draft. Coloring is left out: it does not test anything from the lesson.
const DRAFT_TYPES: GameType[] = ["scramble", "matching", "memory_verse", "story_order", "true_false", "missing_word"];
const KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface DraftGame {
  key: string;
  type: string;
  title: string;
  instructions?: string;
  config: unknown;
  answerKey?: unknown;
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const byAt = args.indexOf("--by");
  const filePath = args.find((arg, i) => !arg.startsWith("--") && i !== byAt + 1);
  const byEmail = byAt >= 0 ? args[byAt + 1] : undefined;
  if (!filePath || !byEmail) {
    console.error("Usage: npm run load:games -- <games.json> --by <admin email> [--apply] [--replace-drafts]");
    process.exit(1);
  }
  return { filePath, byEmail, apply: args.includes("--apply"), replaceDrafts: args.includes("--replace-drafts") };
};

// The verse must be the one printed in the lesson; only spacing and quote styles may differ.
const sameText = (a: string, b: string) => {
  const clean = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
  return clean(a) === clean(b);
};

const checkGame = (game: DraftGame): string | null => {
  if (!game || typeof game !== "object") return "is not an object";
  if (typeof game.key !== "string" || !KEY_PATTERN.test(game.key)) return "needs a key in lowercase-with-dashes";
  if (!isGameType(game.type) || !DRAFT_TYPES.includes(game.type)) {
    return `type must be one of ${DRAFT_TYPES.join(", ")} (got ${game.type})`;
  }
  if (typeof game.title !== "string" || !game.title.trim()) return "needs a title";
  if (game.instructions !== undefined && typeof game.instructions !== "string") return "instructions must be text";
  return GAME_TYPES[game.type].validate(game.config, game.answerKey);
};

const main = async () => {
  const { filePath, byEmail, apply, replaceDrafts } = parseArgs();
  assertOutsideRepo("The games file", filePath);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (typeof data.grade !== "string" || !Array.isArray(data.chapters) || !data.chapters.length) {
    throw new Error('The file needs "grade" (e.g. "1") and a non-empty "chapters" list');
  }

  await connectToDatabase();
  console.log(`Database host: ${mongoose.connection.host}`);

  const author = await User.findOne({ email: byEmail.toLowerCase(), role: { $in: ["admin", "superAdmin"] } }).select("_id role");
  if (!author) throw new Error(`No admin or super admin with the email ${byEmail}`);

  const grades = await Grade.find({ grade: data.grade }).select("_id grade").lean();
  if (grades.length !== 1) throw new Error(`Expected exactly one grade named "${data.grade}", found ${grades.length}`);
  const gradeId = grades[0]._id;

  const problems: string[] = [];
  const toInsert: any[] = [];
  const toReplace: { id: Types.ObjectId; update: any; label: string }[] = [];
  const skipped: string[] = [];

  for (const entry of data.chapters) {
    const number = entry?.chapterNumber;
    const games: DraftGame[] = Array.isArray(entry?.games) ? entry.games : [];
    const chapters = await Chapter.find({ gradeId, chapterNumber: number }).select("_id title").lean();
    if (chapters.length !== 1) {
      problems.push(`Chapter ${number}: expected one chapter with this number in grade ${data.grade}, found ${chapters.length}`);
      continue;
    }
    const chapter = chapters[0];
    if (!games.length) problems.push(`Chapter ${number}: no games`);
    const keys = games.map((game) => game?.key);
    if (new Set(keys).size !== keys.length) problems.push(`Chapter ${number}: game keys must be unique`);

    const lesson = await Lesson.findOne({ gradeId, lessonNumber: number }).select("memoryVerse").lean();
    const existing = await ChapterGame.find({ chapterId: chapter._id }).select("key status source order").lean();
    let nextOrder = existing.reduce((max, game) => Math.max(max, game.order + 1), 0);

    for (const game of games) {
      const label = `Chapter ${number} "${chapter.title}" / ${game?.key} (${game?.type})`;
      const error = checkGame(game);
      if (error) {
        problems.push(`${label}: ${error}`);
        continue;
      }
      if (game.type === "memory_verse" && lesson?.memoryVerse?.text) {
        const config = game.config as { text: string; reference: string };
        if (!sameText(config.text, lesson.memoryVerse.text) || !sameText(config.reference, lesson.memoryVerse.reference)) {
          problems.push(`${label}: the verse or reference differs from the lesson's memory verse`);
          continue;
        }
      }

      const fields = {
        type: game.type,
        title: game.title.trim(),
        instructions: game.instructions?.trim() ?? "",
        config: game.config,
        answerKey: game.answerKey ?? {},
        source: "ai",
        createdBy: author._id,
      };
      const current = existing.find((item) => item.key === game.key);
      if (!current) {
        toInsert.push({ ...fields, chapterId: chapter._id, gradeId, key: game.key, order: nextOrder++, status: "draft" });
      } else if (replaceDrafts && current.status === "draft" && current.source === "ai") {
        toReplace.push({ id: current._id, update: fields, label });
      } else {
        skipped.push(`${label}: already exists (${current.status}, ${current.source})`);
      }
    }
  }

  for (const doc of toInsert) {
    const error = new ChapterGame(doc).validateSync();
    if (error) problems.push(`Chapter game ${doc.key}: ${error.message}`);
  }

  console.log(`Grade: ${grades[0].grade} (${gradeId})`);
  console.log(`Author: ${byEmail} (${author.role})`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    throw new Error("Some games are invalid; nothing was changed.");
  }

  console.log(`\nNew drafts: ${toInsert.length}`);
  const byType = toInsert.reduce<Record<string, number>>((counts, doc) => ({ ...counts, [doc.type]: (counts[doc.type] ?? 0) + 1 }), {});
  for (const [type, count] of Object.entries(byType)) console.log(`  ${type}: ${count}`);
  if (toReplace.length) {
    console.log(`Drafts to replace: ${toReplace.length}`);
    for (const item of toReplace) console.log(`  ${item.label}`);
  }
  if (skipped.length) {
    console.log(`Skipped (key already used): ${skipped.length}`);
    for (const line of skipped) console.log(`  ${line}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to load the drafts.");
  } else {
    if (toInsert.length) await ChapterGame.insertMany(toInsert, { ordered: true });
    for (const item of toReplace) {
      await ChapterGame.updateOne({ _id: item.id, status: "draft", source: "ai" }, { $set: item.update }, { runValidators: true });
    }
    console.log(`\nInserted ${toInsert.length} and replaced ${toReplace.length} draft(s). Nothing is visible to students until approved.`);
  }
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
