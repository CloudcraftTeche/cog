// hooks/useUploadChapter.ts
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateChapter } from "@/hooks/admin/useChapter";
import { validateChapterForm } from "@/utils/admin/chapter.utils";
import { UploadFormState, FormErrors, ContentItem, Question } from "@/types/admin/chapter.types";

export const useUploadChapter = () => {
  const router = useRouter();
  const createMutation = useCreateChapter();

  const [formState, setFormState] = useState<UploadFormState>({
    title: "",
    description: "",
    selectedGrades: [],
    selectedUnit: "",
    chapter: 1,
    contentItems: [{ type: "video", order: 0, title: "" }],
    questions: [
      { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback(<K extends keyof UploadFormState>(
    field: K,
    value: UploadFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateContentItems = useCallback((items: ContentItem[]) => {
    setFormState((prev) => ({ ...prev, contentItems: items }));
  }, []);

  const updateQuestions = useCallback((questions: Question[]) => {
    setFormState((prev) => ({ ...prev, questions }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateChapterForm(
      formState.title,
      formState.description,
      formState.selectedGrades,
      formState.selectedUnit,
      formState.chapter,
      formState.contentItems,
      formState.questions
    );

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formState]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix all errors before submitting",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", formState.title.trim());
    formData.append("description", formState.description.trim());
    formData.append("unitId", formState.selectedUnit);
    formData.append("chapterNumber", formState.chapter.toString());
    formData.append("gradeIds", JSON.stringify(formState.selectedGrades));

    const contentItemsData = formState.contentItems.map((item, index) => {
      const baseItem: Record<string, unknown> = {
        type: item.type,
        order: index,
        title: item.title || "",
      };

      if (item.type === "text") {
        baseItem.textContent = item.textContent;
      } else if (item.type === "video" && item.videoUrl) {
        baseItem.videoUrl = item.videoUrl;
      }

      return baseItem;
    });

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

    createMutation.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => {
          router.push("/dashboard/admin/chapters");
        }, 1500);
      },
    });
  }, [formState, validateForm, createMutation, router]);

  return {
    formState,
    errors,
    isLoading: createMutation.isPending,
    isSuccess: createMutation.isSuccess,
    updateField,
    updateContentItems,
    updateQuestions,
    handleSubmit,
  };
};