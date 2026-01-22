// hooks/useEditChapter.ts
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useChapter, useUpdateChapter } from "@/hooks/admin/useChapter";
import { validateChapterForm } from "@/utils/admin/chapter.utils";
import { ContentItem, EditQuestion } from "@/types/admin/chapter.types";
import { FormErrors } from "@/types/admin/chapter.types";

interface EditFormState {
  title: string;
  description: string;
  selectedGradeId: string;
  selectedUnitId: string;
  chapterNumber: number;
  contentItems: ContentItem[];
  questions: EditQuestion[];
}

export const useEditChapter = (chapterId: string) => {
  const router = useRouter();
  const { data: chapter, isLoading: fetchLoading } = useChapter(chapterId);

  const [formState, setFormState] = useState<EditFormState>({
    title: "",
    description: "",
    selectedGradeId: "",
    selectedUnitId: "",
    chapterNumber: 1,
    contentItems: [{ type: "video", order: 0, title: "" }],
    questions: [
      { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateMutation = useUpdateChapter(
    formState.selectedGradeId,
    chapterId
  );

  // Populate form when chapter data is loaded
  useEffect(() => {
    if (chapter) {
      setFormState({
        title: chapter.title || "",
        description: chapter.description || "",
        selectedGradeId: chapter.gradeId?._id || "",
        selectedUnitId: chapter.unitId || "",
        chapterNumber: chapter.chapterNumber || 1,
        contentItems:
          chapter.contentItems && chapter.contentItems.length > 0
            ? chapter.contentItems.map((item, index) => ({
                type: item.type,
                order: item.order !== undefined ? item.order : index,
                title: item.title || "",
                textContent: item.textContent || "",
                videoUrl: item.type === "video" ? item.url || "" : "",
                url: item.url || "",
                publicId: item.publicId || null,
              }))
            : [{ type: "video", order: 0, title: "" }],
        questions:
          Array.isArray(chapter.questions) && chapter.questions.length > 0
            ? chapter.questions.map((q, index) => ({
                id: q._id || q.id || index.toString(),
                questionText: q.questionText || "",
                options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
                correctAnswer: q.correctAnswer || "",
              }))
            : [
                {
                  id: "1",
                  questionText: "",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                },
              ],
      });
    }
  }, [chapter]);

  const updateField = useCallback(
    <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateContentItems = useCallback((items: ContentItem[]) => {
    setFormState((prev) => ({ ...prev, contentItems: items }));
  }, []);

  const updateQuestions = useCallback((questions: EditQuestion[]) => {
    setFormState((prev) => ({ ...prev, questions }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateChapterForm(
      formState.title,
      formState.description,
      [formState.selectedGradeId], // Convert to array for validation
      formState.selectedUnitId,
      formState.chapterNumber,
      formState.contentItems,
      formState.questions
    );

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formState]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", formState.title.trim());
    formData.append("description", formState.description.trim());
    formData.append("unitId", formState.selectedUnitId);
    formData.append("chapterNumber", formState.chapterNumber.toString());

    const contentItemsData = formState.contentItems.map((item, index) => ({
      type: item.type,
      order: index,
      title: item.title || "",
      ...(item.type === "text" && { textContent: item.textContent }),
      ...(item.type === "video" && item.videoUrl && { videoUrl: item.videoUrl }),
    }));

    formData.append("contentItems", JSON.stringify(contentItemsData));

    formState.contentItems.forEach((item, index) => {
      if (item.file) {
        formData.append(`content_${index}`, item.file);
      }
    });

    const formattedQuestions = formState.questions.map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.filter((opt) => opt && opt.trim()),
      correctAnswer: q.correctAnswer.trim(),
    }));

    formData.append("questions", JSON.stringify(formattedQuestions));

    updateMutation.mutate(formData, {
      onSuccess: () => {
        router.push("/dashboard/admin/chapters");
      },
    });
  }, [formState, validateForm, updateMutation, router]);

  return {
    formState,
    errors,
    isLoading: updateMutation.isPending,
    fetchLoading,
    updateField,
    updateContentItems,
    updateQuestions,
    handleSubmit,
  };
};