/**
 * LOGOS-153: replace Grade 1's test content with the textbook structure.
 *
 * Deletes the test unit "TEST UNIT 1" and its 5 test chapters (with their
 * progress and Cloudinary files), then creates 6 units and 35 chapters, one per
 * textbook lesson already in the Lesson collection (LOGOS-90).
 *
 * Usage: npm run migrate:grade1-reset [-- --apply]
 *
 * Without --apply it only reports what it would do. It aborts unless Grade 1 is
 * exactly in the expected before-state (or a half-finished run of this script,
 * which it then completes). Only Grade 1 is touched.
 */
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../lib/mongoose";
import { Grade } from "../models/academic/Grade.model";
import { Chapter } from "../models/academic/Chapter.model";
import { TeacherChapter } from "../models/academic/TeacherChapter.model";
import { Lesson } from "../models/academic/Lesson.model";
import { User } from "../models/user/User.model";

const GRADE_ID = "69e7e4d999afab19540a389c";
const GRADE_NAME = "1";
const TEST_UNIT_NAME = "TEST UNIT 1";
const TEST_CHAPTER_NUMBERS = [1, 2, 3, 4, 18];
const LESSON_COUNT = 35;

const UNITS = [
  {
    name: "Unit 1 – God Who Made Us and Loves Us",
    description:
      "God created the world and everything in it because He loves us. We learn about Adam and Eve, what happens when we disobey, Enoch who walked with God, and how God kept Noah safe in the flood.",
    lessons: [1, 5],
  },
  {
    name: "Unit 2 – God Cares for Abraham's Family",
    description:
      "God kept His promises to Abraham and his family. We learn how God looked after Abraham, Lot, Hagar, Isaac, Jacob and Joseph, even in hard times.",
    lessons: [6, 12],
  },
  {
    name: "Unit 3 – God Protects and Hears His People",
    description:
      "God protects those who trust Him and hears their prayers. We learn about baby Moses, Hannah's prayer, David chosen as king, Elijah fed by ravens, the three young men in the fire, and Jonah.",
    lessons: [13, 19],
  },
  {
    name: "Unit 4 – Jesus Is Born and Helps People",
    description:
      "God sent His Son Jesus into the world. We learn about Jesus' birth, the shepherds who visited Him, how He welcomed little children, and how He healed the sick and the blind.",
    lessons: [20, 24],
  },
  {
    name: "Unit 5 – Jesus Loves Everyone",
    description:
      "Jesus loves everyone, even people others leave out. We learn how He raised Lazarus, visited Zacchaeus, healed a leper, searched for the lost sheep and talked with the Samaritan woman.",
    lessons: [25, 29],
  },
  {
    name: "Unit 6 – Jesus Died and Rose Again for Us",
    description:
      "Jesus loved us so much that He gave His life for us. We learn about His entry into Jerusalem, His trial, the cross, His burial, and how He rose from the tomb and lives today.",
    lessons: [30, 35],
  },
];

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sameNumbers = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((n, i) => n === [...b].sort((x, y) => x - y)[i]);

async function runMigration() {
  const apply = process.argv.includes("--apply");
  await connectToDatabase();
  console.log(`Database host: ${mongoose.connection.host}`);
  console.log(apply ? "Mode: APPLY" : "Mode: dry run (pass --apply to make changes)");

  const grade = await Grade.findById(GRADE_ID);
  if (!grade || grade.grade !== GRADE_NAME) {
    throw new Error(`Grade ${GRADE_ID} named "${GRADE_NAME}" not found`);
  }

  const teacherChapters = await TeacherChapter.countDocuments({ gradeId: grade._id });
  if (teacherChapters) throw new Error(`Grade 1 has ${teacherChapters} teacher chapters; aborting`);

  const lessons = await Lesson.find({ gradeId: grade._id }).sort({ lessonNumber: 1 }).lean();
  if (!sameNumbers(lessons.map((l) => l.lessonNumber), Array.from({ length: LESSON_COUNT }, (_, i) => i + 1))) {
    throw new Error(`Expected lessons 1-${LESSON_COUNT} for Grade 1, found ${lessons.length}; run load:lessons first`);
  }

  const creator = await User.findOne({ role: "superAdmin" }).sort({ createdAt: 1 }).select("_id name email");
  if (!creator) throw new Error("No super admin found to set as chapter creator");

  const unitNames = grade.units.map((u) => u.name);
  const chapters = await Chapter.find({ gradeId: grade._id });
  const isOriginal =
    unitNames.length === 1 &&
    unitNames[0] === TEST_UNIT_NAME &&
    sameNumbers(chapters.map((c) => c.chapterNumber), TEST_CHAPTER_NUMBERS) &&
    chapters.every((c) => c.unitId.equals(grade.units[0]._id as Types.ObjectId));
  const isHalfDone =
    unitNames.length === UNITS.length &&
    UNITS.every((u, i) => unitNames[i] === u.name) &&
    chapters.every((c) => grade.units.some((u) => c.unitId.equals(u._id as Types.ObjectId)));

  if (!isOriginal && !isHalfDone) {
    console.log("Units:", unitNames);
    console.log("Chapters:", chapters.map((c) => c.chapterNumber));
    throw new Error("Grade 1 is not in the expected state; nothing was changed");
  }

  if (isOriginal) {
    console.log(`\nWill delete unit "${TEST_UNIT_NAME}" and ${chapters.length} chapters:`);
    for (const chapter of chapters) {
      const files = chapter.contentItems.filter((i) => i.publicId).map((i) => `${i.type}:${i.publicId}`);
      const students = chapter.studentProgress?.length ?? 0;
      console.log(
        `  Chapter ${chapter.chapterNumber} "${chapter.title}": progress for ${students} student(s)` +
          (files.length ? `, Cloudinary files ${files.join(", ")}` : "")
      );
    }
    const studentIds = [...new Set(chapters.flatMap((c) => (c.studentProgress ?? []).map((p) => p.studentId.toString())))];
    if (studentIds.length) {
      const students = await User.find({ _id: { $in: studentIds } }).select("name email").lean();
      console.log(`  Progress being removed belongs to: ${students.map((s) => `${s.name} <${s.email}>`).join(", ")}`);
    }
  } else {
    console.log(`\nUnits already replaced; ${chapters.length} of ${LESSON_COUNT} chapters exist. Will create the rest.`);
  }

  console.log(`\nWill create ${UNITS.length} units and chapters 1-${LESSON_COUNT} (unpublished), creator ${creator.name} <${creator.email}>:`);
  for (const unit of UNITS) {
    console.log(`  ${unit.name}: lessons ${unit.lessons[0]}-${unit.lessons[1]}`);
  }

  if (!apply) {
    console.log("\nDry run complete. Nothing was changed.");
    return;
  }

  if (isOriginal) {
    for (const chapter of chapters) {
      await chapter.deleteOne();
      console.log(`  Deleted chapter ${chapter.chapterNumber}`);
    }
    grade.set(
      "units",
      UNITS.map((unit, index) => ({ name: unit.name, description: unit.description, orderIndex: index }))
    );
    await grade.save();
    console.log(`  Replaced units`);
  }

  const existingNumbers = new Set(
    (await Chapter.find({ gradeId: grade._id }).select("chapterNumber").lean()).map((c) => c.chapterNumber)
  );
  const newChapters = lessons
    .filter((lesson) => !existingNumbers.has(lesson.lessonNumber))
    .map((lesson) => {
      const unitIndex = UNITS.findIndex(
        (u) => lesson.lessonNumber >= u.lessons[0] && lesson.lessonNumber <= u.lessons[1]
      );
      return {
        title: lesson.title,
        chapterNumber: lesson.lessonNumber,
        gradeId: grade._id,
        unitId: grade.units[unitIndex]._id,
        description: `Bible reading: ${lesson.readingPortion}`,
        contentItems: [
          {
            type: "text",
            title: "Memory verse",
            textContent: `${escapeHtml(lesson.memoryVerse.text)}\n${escapeHtml(lesson.memoryVerse.reference)}`,
            order: 0,
          },
        ],
        createdBy: creator._id,
        isPublished: false,
        requiresPreviousChapter: true,
      };
    });
  await Chapter.insertMany(newChapters, { ordered: true });
  console.log(`  Created ${newChapters.length} chapters`);
  console.log("\nGrade 1 reset complete.");
}

runMigration()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
