"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useGrades,
  useCreateTeacherChapter,
} from "@/hooks/admin/use-teacher-chapters";
import { useUnitsForGrades } from "@/hooks/admin/use-units";
import {
  Question,
  ValidationErrors,
} from "@/types/admin/teacher-chapter.types";
import {
  validateTeacherChapter,
  filterValidQuestions,
  formatQuestionsForSubmit,
} from "@/lib/admin/validators/teacher-chapter.validation";
import { CreateTeacherChapterForm } from "@/components/admin/teacher-chapters/CreateTeacherChapterForm";
export default function SuperAdminUploadTeacherChapter() {
  const router = useRouter();
  const [contentType, setContentType] = useState<"video" | "text">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [chapter, setChapter] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [requiresPreviousChapter, setRequiresPreviousChapter] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const { units, isLoading: unitsLoading } = useUnitsForGrades(
    selectedGrades,
    grades,
  );
  const { mutate: createChapter, isPending: isCreating } =
    useCreateTeacherChapter();
  const validateForm = (): boolean => {
    const validationErrors = validateTeacherChapter({
      title,
      description,
      selectedGrades,
      selectedUnitId: selectedUnit,
      chapterNumber: chapter,
      contentType,
      videoUrl,
      textContent,
      questions,
      isEdit: false,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const validQuestions = filterValidQuestions(questions);
    const formattedQuestions = formatQuestionsForSubmit(validQuestions);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      contentType,
      unitId: selectedUnit,
      chapterNumber: chapter,
      gradeIds: selectedGrades,
      videoUrl: contentType === "video" ? videoUrl.trim() : undefined,
      textContent: contentType === "text" ? textContent.trim() : undefined,
      questions: formattedQuestions,
      isPublished,
      requiresPreviousChapter,
    };
    createChapter(payload, {
      onSuccess: () => {
        setTimeout(() => {
          router.push("/dashboard/super-admin/teacher-chapters");
        }, 1500);
      },
    });
  };
  return (
    <CreateTeacherChapterForm
      contentType={contentType}
      setContentType={setContentType}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      selectedGrades={selectedGrades}
      setSelectedGrades={setSelectedGrades}
      chapter={chapter}
      setChapter={setChapter}
      videoUrl={videoUrl}
      setVideoUrl={setVideoUrl}
      textContent={textContent}
      setTextContent={setTextContent}
      selectedUnit={selectedUnit}
      setSelectedUnit={setSelectedUnit}
      isPublished={isPublished}
      setIsPublished={setIsPublished}
      requiresPreviousChapter={requiresPreviousChapter}
      setRequiresPreviousChapter={setRequiresPreviousChapter}
      questions={questions}
      setQuestions={setQuestions}
      errors={errors}
      grades={grades}
      units={units}
      isLoading={isCreating}
      gradesLoading={gradesLoading}
      unitsLoading={unitsLoading}
      onSubmit={handleSubmit}
    />
  );
}
