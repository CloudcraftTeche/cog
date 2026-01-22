// utils/chapter.utils.ts
import { Chapter, Grade, Unit } from "@/types/admin/chapter.types";

export const filterChaptersBySearch = (
  chapters: Chapter[],
  searchTerm: string
): Chapter[] => {
  if (!searchTerm) return chapters;

  const lowerSearch = searchTerm.toLowerCase();
  return chapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(lowerSearch) ||
      ch.description.toLowerCase().includes(lowerSearch)
  );
};

export const groupChaptersByGradeAndUnit = (
  chapters: Chapter[],
  grades: Grade[]
) => {
  return grades
    .map((grade) => {
      const gradeChapters = chapters.filter(
        (ch) => ch.gradeId._id === grade._id
      );

      const unitGroups = (grade.units || []).map((unit) => {
        const unitChapters = gradeChapters
          .filter((ch) => {
            const chapterUnitId =
              typeof ch.unitId === "string" ? ch.unitId : ch.unitId;
            const unitIdStr = unit._id
              ? typeof unit._id === "string"
                ? unit._id
                : unit._id
              : "";
            return chapterUnitId === unitIdStr;
          })
          .sort((a, b) => a.chapterNumber - b.chapterNumber);

        return {
          unit,
          chapters: unitChapters,
        };
      });

      return {
        grade,
        unitGroups: unitGroups.filter((ug) => ug.chapters.length > 0),
        totalChapters: gradeChapters.length,
      };
    })
    .filter((g) => g.totalChapters > 0);
};

export const calculateStatistics = (
  completedStudentsCount: number,
  pendingStudentsCount: number,
  completedStudents: Array<{ score: number }>,
  questionsCount: number
) => {
  const totalStudents = completedStudentsCount + pendingStudentsCount;
  const completionRate =
    totalStudents > 0
      ? Math.round((completedStudentsCount / totalStudents) * 100)
      : 0;

  const passingScore = questionsCount * 0.6;
  const passedStudents = completedStudents.filter(
    (s) => (s.score || 0) >= passingScore
  ).length;

  const passRate =
    completedStudentsCount > 0
      ? Math.round((passedStudents / completedStudentsCount) * 100)
      : 0;

  return {
    totalStudents,
    completionRate,
    passRate,
  };
};

export const getContentTypeBadgeText = (type: string): string => {
  switch (type) {
    case "video":
      return "📹 Video";
    case "text":
      return "📚 Text";
    case "pdf":
      return "📄 PDF";
    case "mixed":
      return "🎬 Mixed";
    default:
      return "📚 Content";
  }
};

export const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const formatDateForExcel = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const escapeCSV = (str: string): string =>
  String(str || "").replace(/"/g, '""');

export const getGradeColor = (index: number): string => {
  const colors = [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-500 via-green-500 to-lime-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-indigo-500 via-blue-500 to-cyan-500",
  ];
  return colors[index % colors.length];
};

export const getUnitColor = (index: number): string => {
  const colors = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400",
    "from-green-400 to-emerald-400",
    "from-orange-400 to-red-400",
    "from-rose-400 to-pink-400",
    "from-indigo-400 to-purple-400",
  ];
  return colors[index % colors.length];
};

export const validateChapterForm = (
  title: string,
  description: string,
  selectedGrades: string[],
  selectedUnit: string,
  chapter: number,
  contentItems: Array<{
    type: string;
    textContent?: string;
    videoUrl?: string;
    file?: File;
  }>,
  questions: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
  }>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!title.trim()) {
    errors.title = "Title is required";
  } else if (title.length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  if (!description.trim()) {
    errors.description = "Description is required";
  }

  if (selectedGrades.length === 0) {
    errors.gradeIds = "At least one grade must be selected";
  }

  if (!selectedUnit) {
    errors.unitId = "Unit is required";
  }

  if (chapter < 1) {
    errors.chapterNumber = "Chapter number must be at least 1";
  }

  if (contentItems.length === 0) {
    errors.contentItems = "At least one content item is required";
  } else {
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      if (item.type === "text") {
        if (!item.textContent?.trim()) {
          errors[`content_${i}`] = "Text content is required";
          break;
        }
      } else if (item.type === "video") {
        if (!item.videoUrl?.trim() && !item.file) {
          errors[`content_${i}`] = "Video URL or file is required";
          break;
        }
      } else if (item.type === "pdf") {
        if (!item.file) {
          errors[`content_${i}`] = "PDF file is required";
          break;
        }
      }
    }
  }

  if (questions.length === 0) {
    errors.questions = "At least one question is required";
  } else {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        errors.questions = `Question ${i + 1}: Question text is required`;
        break;
      }
      if (q.options.length !== 4) {
        errors.questions = `Question ${i + 1}: Must have exactly 4 options`;
        break;
      }
      const filledOptions = q.options.filter((opt) => opt && opt.trim());
      if (filledOptions.length < 2) {
        errors.questions = `Question ${i + 1}: At least 2 options must be filled`;
        break;
      }
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        errors.questions = `Question ${i + 1}: Please select a correct answer`;
        break;
      }
      if (!q.options.includes(q.correctAnswer)) {
        errors.questions = `Question ${i + 1}: Correct answer must be one of the options`;
        break;
      }
    }
  }

  return errors;
};