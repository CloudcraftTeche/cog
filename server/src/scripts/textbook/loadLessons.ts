/**
 * Loads extracted textbook lessons (from extract:lessons) into the Lesson collection
 * for one grade. Only inserts lessons; never changes any other collection.
 *
 * Usage: npm run load:lessons -- <lessons.json> --grade "Grade 1" [--apply]
 *
 * Without --apply it is a dry run. It refuses to run if the grade already has
 * lessons, or if the JSON file is inside the repository.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectToDatabase } from "../../lib/mongoose";
import { Grade } from "../../models/academic/Grade.model";
import { Lesson } from "../../models/academic/Lesson.model";

const findRepoRoot = (from: string): string => {
  let dir = from;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate the repository root");
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const gradeAt = args.indexOf("--grade");
  const jsonPath = args.find((arg, i) => !arg.startsWith("--") && i !== gradeAt + 1);
  const gradeName = gradeAt >= 0 ? args[gradeAt + 1] : undefined;
  if (!jsonPath || !gradeName) {
    console.error('Usage: npm run load:lessons -- <lessons.json> --grade "Grade 1" [--apply]');
    process.exit(1);
  }
  return { jsonPath, gradeName, apply: args.includes("--apply") };
};

const main = async () => {
  const { jsonPath, gradeName, apply } = parseArgs();
  const relative = path.relative(findRepoRoot(__dirname), path.resolve(jsonPath));
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    throw new Error("The lessons file must be outside the repository.");
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (!Array.isArray(data.lessons) || !data.lessons.length) throw new Error("No lessons in the file");

  await connectToDatabase();
  const host = mongoose.connection.host;
  const grades = await Grade.find({ grade: gradeName }).select("_id grade").lean();
  if (grades.length !== 1) {
    throw new Error(`Expected exactly one grade named "${gradeName}", found ${grades.length}`);
  }
  const gradeId = grades[0]._id;
  const existing = await Lesson.countDocuments({ gradeId });
  if (existing) throw new Error(`${gradeName} already has ${existing} lessons; nothing was changed.`);

  const docs = data.lessons.map((lesson: any) => ({
    gradeId,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    readingPortion: lesson.readingPortion,
    objectives: lesson.objectives,
    introduction: lesson.introduction,
    story: lesson.story,
    questions: lesson.questions,
    memoryVerse: lesson.memoryVerse,
    source: { book: data.source?.book, edition: data.source?.edition, pages: lesson.source?.pages ?? [] },
  }));
  const invalid = docs
    .map((doc: any) => ({ n: doc.lessonNumber, error: new Lesson(doc).validateSync() }))
    .filter((r: any) => r.error);
  if (invalid.length) {
    for (const r of invalid) console.error(`  Lesson ${r.n}: ${r.error.message}`);
    throw new Error("Some lessons are invalid; nothing was changed.");
  }

  console.log(`Database host: ${host}`);
  console.log(`Grade: ${grades[0].grade} (${gradeId})`);
  console.log(`Lessons to insert: ${docs.length} (${docs[0].lessonNumber}-${docs[docs.length - 1].lessonNumber})`);
  if (!apply) {
    console.log("Dry run only. Re-run with --apply to insert.");
  } else {
    const inserted = await Lesson.insertMany(docs, { ordered: true });
    console.log(`Inserted ${inserted.length} lessons.`);
  }
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
