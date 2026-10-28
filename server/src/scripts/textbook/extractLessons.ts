/**
 * Extracts the lessons of a COG Kerala Sunday School textbook PDF into JSON.
 *
 * Usage: npm run extract:lessons -- <textbook.pdf> <output.lessons.json>
 *
 * The textbook is copyrighted and must never enter the repository, so both
 * paths have to be outside it. Review the output before loading it with the
 * lesson migration.
 */
import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import { assertOutsideRepo, findRepoRoot } from "./outsideRepo";

export interface ExtractedLesson {
  lessonNumber: number;
  title: string;
  readingPortion: string;
  objectives: string[];
  introduction: string;
  story: string;
  questions: string[];
  memoryVerse: { text: string; reference: string };
  source: { pages: number[] };
}

const PAGES_PER_LESSON = 3;
const PAGE_HEADER = /^\d*\s*COG KERALA STATE SUNDAY SCHOOL DEPARTMENT\s*$/;
const BIBLE_REFERENCE =
  /((?:[1-3]|I{1,3})?\s*[A-Za-z]+\.?\s*\d+\s*:\s*\d+(?:\s*-\s*\d+)?)\.?\s*$/;

const readPages = async (pdfPath: string): Promise<string[][]> => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableFontFace: true, verbosity: 0 }).promise;
  const pages: string[][] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str + (item.hasEOL ? "\n" : "");
    }
    pages.push(
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !PAGE_HEADER.test(line))
    );
  }
  return pages;
};

const joinLines = (lines: string[]): string =>
  lines
    .reduce((text, line) => {
      if (!text) return line;
      if (/[a-z]-$/.test(text) && /^[a-z]/.test(line)) return text.slice(0, -1) + line;
      return `${text} ${line}`;
    }, "")
    .replace(/\s+/g, " ")
    .trim();

const isHeading = (line: string) => /^[A-Z][A-Z0-9 ,'’!?.-]+$/.test(line) && /[A-Z]{3}/.test(line);

const joinParagraphs = (lines: string[]): string => {
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) blocks.push(joinLines(current));
    current = [];
  };
  let previousWasHeading = false;
  for (const line of lines) {
    if (isHeading(line)) {
      flush();
      if (previousWasHeading) blocks[blocks.length - 1] += ` ${line}`;
      else blocks.push(line);
      previousWasHeading = true;
    } else {
      previousWasHeading = false;
      current.push(line);
    }
  }
  flush();
  return blocks.join("\n\n");
};

const splitNumbered = (lines: string[]): string[] => {
  const items: string[][] = [];
  for (const line of lines) {
    if (/^\d+\s*\./.test(line) || !items.length) items.push([line.replace(/^\d+\s*\.\s*/, "")]);
    else items[items.length - 1].push(line);
  }
  return items.map(joinLines).filter(Boolean);
};

// Objectives are numbered inline ("... understand that 1. X and 2. Y"), so split on the numbers
// and carry a lead-in such as "Help the students understand that" into each item.
const COMMON_FIRST_WORDS = /^(They|We|Our|Us|It|Man|Nothing|Innocent|When|Children)\b/;

const splitObjectives = (lines: string[]): string[] => {
  const parts = joinLines(lines)
    .split(/(?:^|\s|(?<=[.;,]))\d+\s*\.(?!\d)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2 || !/\bthat$/.test(parts[0])) return parts;
  const [leadIn, ...items] = parts;
  return items.map((item) =>
    `${leadIn} ${COMMON_FIRST_WORDS.test(item) ? item.charAt(0).toLowerCase() + item.slice(1) : item}`
  );
};

const parseContents = (pages: string[][]) => {
  const contents = pages.find((lines) => lines.includes("CONTENTS"));
  if (!contents) throw new Error("Contents page not found");
  return contents.flatMap((line) => {
    const match = line.match(/^(\d+)\.\s+(.+?)\s+(\d+)$/);
    return match ? [{ lessonNumber: Number(match[1]), title: match[2].trim(), startPage: Number(match[3]) }] : [];
  });
};

const parseBookDetails = (pages: string[][]) => {
  const titlePage = pages.find((lines) => lines.includes("SUNDAY SCHOOL TEXT BOOK")) ?? [];
  const at = titlePage.indexOf("SUNDAY SCHOOL TEXT BOOK");
  return {
    book: at >= 0 ? `COG Kerala State Sunday School Text Book, ${titlePage[at + 1]}` : "Unknown textbook",
    edition: titlePage.find((line) => /edition/i.test(line)) ?? "Unknown edition",
  };
};

const removeLessonBanner = (lines: string[]): string[] => {
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "Fill with colour") continue;
    if (/^Lesson\s*-\s*\d+$/.test(lines[i])) {
      while (i + 1 < lines.length && isHeading(lines[i + 1]) && !/^(READING|OBJECTIVE|INTRODUCTION|LESSON$)/.test(lines[i + 1])) i++;
      continue;
    }
    result.push(lines[i]);
  }
  return result;
};

const indexOfLine = (lines: string[], pattern: RegExp, from = 0) => {
  for (let i = from; i < lines.length; i++) if (pattern.test(lines[i])) return i;
  return -1;
};

const parseLesson = (
  entry: { lessonNumber: number; title: string; startPage: number },
  pages: string[][]
): { lesson: ExtractedLesson; problems: string[] } => {
  const pageNumbers = Array.from({ length: PAGES_PER_LESSON }, (_, i) => entry.startPage + i);
  const [first, second, activity] = pageNumbers.map((n) => pages[n - 1] ?? []);
  const lines = removeLessonBanner([...first, ...second]);
  const problems: string[] = [];

  const readingAt = indexOfLine(lines, /READING\s*PORTIONS?\s*:/);
  let readingPortion = readingAt >= 0 ? lines[readingAt].replace(/^.*READING\s*PORTIONS?\s*:\s*/, "") : "";
  let cursor = readingAt + 1;
  while (
    readingAt >= 0 &&
    /(;|[A-Za-z])$/.test(readingPortion) &&
    /^(\d|[A-Z][a-z]+\.?\s*\d)/.test(lines[cursor] ?? "")
  ) {
    readingPortion = `${readingPortion} ${lines[cursor]}`;
    cursor++;
  }

  const introAt = indexOfLine(lines, /^INTRODUCTION:?$/, cursor);
  const lessonAt = indexOfLine(lines, /^LESSON:?$/, introAt + 1);
  const questionsAt = indexOfLine(lines, /^QUESTIONS:?/, lessonAt + 1);

  const aidsAt = indexOfLine(lines, /^TEACHING AIDS/, cursor);
  const objectivesEnd = aidsAt >= 0 && aidsAt < introAt ? aidsAt : introAt;
  const objectiveLines = lines
    .slice(cursor, objectivesEnd >= 0 ? objectivesEnd : cursor)
    .map((line) => line.replace(/^OBJECTIVES?\s*:?\s*/, ""))
    .filter(Boolean);

  const memoryAt = activity.reduce((found, line, i) => (/^Memori[sz]e$/.test(line) ? i : found), -1);
  const verseLines: string[] = [];
  let reference = "";
  for (let i = memoryAt + 1; memoryAt >= 0 && i < activity.length; i++) {
    const match = activity[i].match(BIBLE_REFERENCE);
    if (match) {
      const before = activity[i].slice(0, match.index).trim();
      if (before) verseLines.push(before);
      reference = match[1].replace(/\s*:\s*/, ":").replace(/\s+/g, " ").trim();
      break;
    }
    verseLines.push(activity[i]);
  }

  const lesson: ExtractedLesson = {
    lessonNumber: entry.lessonNumber,
    title: entry.title,
    readingPortion: readingPortion.replace(/\s+/g, " ").trim(),
    objectives: splitObjectives(objectiveLines),
    introduction: introAt >= 0 && lessonAt > introAt ? joinParagraphs(lines.slice(introAt + 1, lessonAt)) : "",
    story: lessonAt >= 0 && questionsAt > lessonAt ? joinParagraphs(lines.slice(lessonAt + 1, questionsAt)) : "",
    questions: questionsAt >= 0 ? splitNumbered(lines.slice(questionsAt + 1)) : [],
    memoryVerse: { text: joinLines(verseLines), reference },
    source: { pages: pageNumbers },
  };

  if (!lesson.readingPortion) problems.push("reading portion");
  if (!lesson.objectives.length) problems.push("objectives");
  if (!lesson.introduction) problems.push("introduction");
  if (!lesson.story) problems.push("story");
  if (!lesson.questions.length) problems.push("questions");
  if (!lesson.memoryVerse.text || !lesson.memoryVerse.reference) problems.push("memory verse");
  return { lesson, problems };
};

const main = async () => {
  const [pdfPath, outputPath] = process.argv.slice(2);
  if (!pdfPath || !outputPath) {
    console.error("Usage: npm run extract:lessons -- <textbook.pdf> <output.lessons.json>");
    process.exit(1);
  }
  const repoRoot = findRepoRoot(__dirname);
  assertOutsideRepo("The PDF", pdfPath, repoRoot);
  assertOutsideRepo("The output file", outputPath, repoRoot);

  const pages = await readPages(pdfPath);
  const contents = parseContents(pages);
  if (!contents.length) throw new Error("No lessons found on the contents page");

  const results = contents.map((entry) => parseLesson(entry, pages));
  const incomplete = results.filter((r) => r.problems.length);

  fs.writeFileSync(
    path.resolve(outputPath),
    JSON.stringify(
      {
        source: { ...parseBookDetails(pages), file: path.basename(pdfPath), extractedAt: new Date().toISOString() },
        lessons: results.map((r) => r.lesson),
      },
      null,
      2
    )
  );

  console.log(`Extracted ${results.length} lessons to ${path.resolve(outputPath)}`);
  for (const r of incomplete) {
    console.warn(`  Lesson ${r.lesson.lessonNumber}: missing ${r.problems.join(", ")} (fix by hand before loading)`);
  }
  if (incomplete.length) process.exitCode = 2;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
