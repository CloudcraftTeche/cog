"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGrades, useTeacherChapter, useUpdateTeacherChapter } from "@/hooks/admin/use-teacher-chapters";
import { useUnitsForGrade } from "@/hooks/admin/use-units";
import { EditQuestion, ValidationErrors } from "@/types/admin/teacher-chapter.types";
import { validateTeacherChapter, formatQuestionsForSubmit } from "@/lib/admin/validators/teacher-chapter.validation";
import { EditTeacherChapterForm } from "@/components/admin/teacher-chapters/EditTeacherChapterForm";
export default function EditTeacherChapterPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState("content");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"video" | "text">("text");
  const [videoUrl, setVideoUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [questions, setQuestions] = useState<EditQuestion[]>([
    {
      id: "1",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const { data: chapter, isLoading: chapterLoading } = useTeacherChapter(id);
  const { mutate: updateChapter, isPending: isUpdating } = useUpdateTeacherChapter(id);
  const { units, isLoading: unitsLoading } = useUnitsForGrade(selectedGradeId, grades);
  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || "");
      setDescription(chapter.description || "");
      setContentType(chapter.contentType || "text");
      setTextContent(chapter.textContent || "");
      setVideoUrl(chapter.videoUrl || "");
      const gradeId = typeof chapter.gradeId === "string" ? chapter.gradeId : ((chapter.gradeId as any)?._id || "");
      setSelectedGradeId(gradeId);
      const unitId = typeof chapter.unitId === "string" ? chapter.unitId : ((chapter.unitId as any)?._id || "");
      setSelectedUnitId(unitId);
      setChapterNumber(chapter.chapterNumber || 1);
      if (chapter.questions && chapter.questions.length > 0) {
        setQuestions(
          chapter.questions.map((q: any, index: number) => ({
            id: q._id || q.id || index.toString(),
            questionText: q.questionText || "",
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            correctAnswer: q.correctAnswer || "",
          }))
        );
      }
    }
  }, [chapter]);
  const validateForm = (): boolean => {
    const validationErrors = validateTeacherChapter({
      title,
      description,
      selectedGradeId,
      selectedUnitId,
      chapterNumber,
      contentType,
      videoUrl,
      textContent,
      questions,
      isEdit: true,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      if (
        validationErrors.title ||
        validationErrors.description ||
        validationErrors.gradeId ||
        validationErrors.unitId ||
        validationErrors.chapterNumber ||
        validationErrors.videoUrl ||
        validationErrors.textContent
      ) {
        setActiveTab("content");
      } else if (validationErrors.questions) {
        setActiveTab("questions");
      }
    }
    return Object.keys(validationErrors).length === 0;
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const formattedQuestions = formatQuestionsForSubmit(questions);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      contentType,
      unitId: selectedUnitId,
      chapterNumber,
      videoUrl: contentType === "video" ? videoUrl.trim() : undefined,
      textContent: contentType === "text" ? textContent.trim() : undefined,
      questions: formattedQuestions,
    };
    updateChapter(payload, {
      onSuccess: () => {
        router.push("/dashboard/admin/teacher-chapters");
      },
    });
  };
  const isLoading = chapterLoading || gradesLoading;
  return (
    <EditTeacherChapterForm
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      contentType={contentType}
      setContentType={setContentType}
      videoUrl={videoUrl}
      setVideoUrl={setVideoUrl}
      textContent={textContent}
      setTextContent={setTextContent}
      selectedGradeId={selectedGradeId}
      setSelectedGradeId={setSelectedGradeId}
      selectedUnitId={selectedUnitId}
      setSelectedUnitId={setSelectedUnitId}
      chapterNumber={chapterNumber}
      setChapterNumber={setChapterNumber}
      questions={questions}
      setQuestions={setQuestions}
      errors={errors}
      grades={grades}
      units={units}
      isLoading={isUpdating}
      fetchLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}