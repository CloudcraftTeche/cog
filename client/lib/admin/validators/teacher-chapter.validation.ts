

import { Question, ValidationErrors } from "@/types/admin/teacher-chapter.types";

interface ValidateChapterParams {
  title: string;
  description: string;
  selectedGrades?: string[];
  selectedGradeId?: string;
  selectedUnitId?: string;
  chapterNumber: number;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  questions: Question[];
  isEdit?: boolean;
}

export function validateTeacherChapter({
  title,
  description,
  selectedGrades,
  selectedGradeId,
  selectedUnitId,
  chapterNumber,
  contentType,
  videoUrl,
  textContent,
  questions,
  isEdit = false,
}: ValidateChapterParams): ValidationErrors {
  const errors: ValidationErrors = {};

  
  if (!title.trim()) {
    errors.title = "Title is required";
  } else if (title.length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  
  if (!description.trim()) {
    errors.description = "Description is required";
  }

  
  if (!isEdit && selectedGrades && selectedGrades.length === 0) {
    errors.gradeIds = "At least one grade must be selected";
  }

  if (isEdit && !selectedGradeId) {
    errors.gradeId = "Grade is required";
  }

  
  if (!selectedUnitId) {
    errors.unitId = "Unit is required";
  }

  
  if (chapterNumber < 1) {
    errors.chapterNumber = "Chapter number must be at least 1";
  }

  
  if (contentType === "video") {
    if (!videoUrl?.trim()) {
      errors.videoUrl = "Video URL is required for video content";
    } else {
      try {
        new URL(videoUrl);
      } catch {
        errors.videoUrl = "Please enter a valid URL";
      }
    }
  }

  if (contentType === "text") {
    if (!textContent?.trim()) {
      errors.textContent = "Text content is required for text content type";
    }
  }

  
  if (!isEdit && questions.length === 0) {
    errors.questions = "At least one question is required";
  } else if (questions.length > 0) {
    const questionErrors = validateQuestions(questions);
    if (questionErrors) {
      errors.questions = questionErrors;
    }
  }

  return errors;
}

export function validateQuestions(questions: Question[]): string | null {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    
    if (!q.questionText.trim() && q.options.every(opt => !opt.trim())) {
      continue;
    }

    if (!q.questionText.trim()) {
      return `Question ${i + 1}: Question text is required`;
    }

    const filledOptions = q.options.filter((opt) => opt && opt.trim());

    if (q.options.length !== 4) {
      return `Question ${i + 1}: Must have exactly 4 options`;
    }

    if (filledOptions.length < 2) {
      return `Question ${i + 1}: At least 2 options must be filled`;
    }

    if (!q.correctAnswer || !q.correctAnswer.trim()) {
      return `Question ${i + 1}: Please select a correct answer`;
    }

    if (!q.options.includes(q.correctAnswer)) {
      return `Question ${i + 1}: Correct answer must be one of the options`;
    }
  }

  return null;
}

export function filterValidQuestions(questions: Question[]) {
  return questions.filter(
    (q) =>
      q.questionText.trim() &&
      q.options.filter((opt) => opt.trim()).length >= 2 &&
      q.correctAnswer.trim()
  );
}

export function formatQuestionsForSubmit(questions: Question[]) {
  return questions.map((q) => ({
    questionText: q.questionText.trim(),
    options: q.options.filter((opt) => opt && opt.trim()),
    correctAnswer: q.correctAnswer.trim(),
  }));
}