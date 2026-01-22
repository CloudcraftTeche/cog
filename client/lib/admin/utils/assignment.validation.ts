
import { IAssignmentForm, IValidationError, MAX_FILE_SIZE_BYTES } from "@/types/admin/assignment.types";

export const validateAssignmentForm = (
  form: IAssignmentForm
): IValidationError[] => {
  const errors: IValidationError[] = [];

  // Title validation
  if (!form.title || form.title?.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (form.title.length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters" });
  } else if (form.title.length > 200) {
    errors.push({ field: "title", message: "Title cannot exceed 200 characters" });
  }

  // Description validation
  if (!form.description || form.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" });
  } else if (form.description.length < 10) {
    errors.push({ field: "description", message: "Description must be at least 10 characters" });
  }

  // Grade validation
  if (!form.gradeIds || form.gradeIds.length === 0) {
    errors.push({ field: "gradeIds", message: "Please select at least one grade" });
  }

  // Date validation
  if (!form.startDate) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }

  if (!form.endDate) {
    errors.push({ field: "endDate", message: "End date is required" });
  }

  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      errors.push({ field: "endDate", message: "End date must be after start date" });
    }
  }

  // Content validation
  if (form.contentType === "video" && !form.videoFile) {
    errors.push({ field: "videoFile", message: "Video file is required" });
  }

  if (form.contentType === "pdf" && !form.pdfFile) {
    errors.push({ field: "pdfFile", message: "PDF file is required" });
  }

  if (form.contentType === "text" && (!form.textContent || form.textContent.trim().length === 0)) {
    errors.push({ field: "textContent", message: "Text content is required" });
  }

  // File size validation
  if (form.videoFile && form.videoFile.size > MAX_FILE_SIZE_BYTES) {
    errors.push({ 
      field: "videoFile", 
      message: `Video file size exceeds 25MB (${(form.videoFile.size / (1024 * 1024)).toFixed(2)}MB)` 
    });
  }

  if (form.pdfFile && form.pdfFile.size > MAX_FILE_SIZE_BYTES) {
    errors.push({ 
      field: "pdfFile", 
      message: `PDF file size exceeds 25MB (${(form.pdfFile.size / (1024 * 1024)).toFixed(2)}MB)` 
    });
  }

  // Marks validation
  if (form.totalMarks !== undefined && form.totalMarks < 0) {
    errors.push({ field: "totalMarks", message: "Total marks cannot be negative" });
  }

  if (form.passingMarks !== undefined && form.passingMarks < 0) {
    errors.push({ field: "passingMarks", message: "Passing marks cannot be negative" });
  }

  if (
    form.totalMarks !== undefined && 
    form.passingMarks !== undefined && 
    form.passingMarks > form.totalMarks
  ) {
    errors.push({ field: "passingMarks", message: "Passing marks cannot exceed total marks" });
  }

  // Questions validation
  if (!form.questions || form.questions.length === 0) {
    errors.push({ field: "questions", message: "At least one question is required" });
  } else {
    form.questions.forEach((q, index) => {
      if (!q.questionText || q.questionText?.trim().length === 0) {
        errors.push({ 
          field: `questions[${index}].questionText`, 
          message: `Question ${index + 1}: Question text is required` 
        });
      }

      const validOptions = q.options.filter((opt: string) => opt?.trim().length > 0);
      if (validOptions.length < 2) {
        errors.push({ 
          field: `questions[${index}].options`, 
          message: `Question ${index + 1}: At least 2 options are required` 
        });
      }

      if (!q.correctAnswer) {
        errors.push({ 
          field: `questions[${index}].correctAnswer`, 
          message: `Question ${index + 1}: Correct answer must be selected` 
        });
      }
    });
  }

  return errors;
};

export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 25
): IValidationError | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.some(type => file.type.startsWith(type))) {
    return {
      field: "file",
      message: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      field: "file",
      message: `File size exceeds ${maxSizeMB}MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    };
  }

  return null;
};