import { Chapter } from "./studentChapter.service";
import { GroupedChapterData } from "./teacherChapter.service";
export function groupChaptersByGradeAndUnit(chapters: Chapter[]): GroupedChapterData[] {
  const gradeMap = new Map<string, GroupedChapterData>();
  chapters.forEach((chapter) => {
    const gradeId = chapter.gradeId?._id;
    if (!gradeId) return;
    if (!gradeMap.has(gradeId)) {
      gradeMap.set(gradeId, {
        grade: {
          _id: gradeId,
          grade: chapter.gradeId.grade,
          units: [],
        },
        unitGroups: [],
        totalChapters: 0,
      });
    }
    const gradeData = gradeMap.get(gradeId)!;
    gradeData.totalChapters++;
    let unitGroup = gradeData.unitGroups.find(
      (ug) => ug.unit._id === chapter.unitId
    );
    if (!unitGroup) {
      unitGroup = {
        unit: {
          _id: chapter.unitId,
          name: chapter.unitName || "Unnamed Unit",
          description: chapter.unitDescription,
          orderIndex: gradeData.unitGroups.length,
        },
        chapters: [],
      };
      gradeData.unitGroups.push(unitGroup);
    }
    unitGroup.chapters.push(chapter as any);
  });
  gradeMap.forEach((gradeData) => {
    gradeData.unitGroups.forEach((unitGroup) => {
      unitGroup.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    });
  });
  return Array.from(gradeMap.values()).filter((g) => g.totalChapters > 0);
}
export function calculateQuizScore(
  questions: { correctAnswer: string }[],
  selectedAnswers: Record<number, string>
): number {
  if (!questions.length) return 0;
  const correctCount = questions.reduce((count, q, i) => {
    return selectedAnswers[i] === q.correctAnswer ? count + 1 : count;
  }, 0);
  return Math.round((correctCount / questions.length) * 100);
}
export function areAllQuestionsAnswered(
  questionCount: number,
  selectedAnswers: Record<number, string>
): boolean {
  return Array.from({ length: questionCount }, (_, i) => i).every(
    (i) => selectedAnswers[i] !== undefined
  );
}
export function getStatusColorClass(
  status?: "locked" | "accessible" | "in_progress" | "completed"
): string {
  switch (status) {
    case "completed":
      return "from-green-400 to-emerald-500";
    case "in_progress":
      return "from-blue-400 to-cyan-500";
    case "locked":
      return "from-gray-300 to-gray-400";
    default:
      return "from-purple-400 to-pink-500";
  }
}
export function formatChapterNumber(chapterNumber: number): string {
  return `Chapter ${chapterNumber}`;
}
export function extractYouTubeVideoId(url: string): string | null {
  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1]?.split("&")[0] || null;
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] || null;
  }
  return null;
}
export function filterChaptersBySearch(
  chapters: Chapter[],
  searchTerm: string
): Chapter[] {
  if (!searchTerm.trim()) return chapters;
  const lowerSearch = searchTerm.toLowerCase();
  return chapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(lowerSearch) ||
      ch.description?.toLowerCase().includes(lowerSearch) ||
      ch.unitName?.toLowerCase().includes(lowerSearch)
  );
}