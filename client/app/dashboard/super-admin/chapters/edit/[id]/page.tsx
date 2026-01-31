"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import Link from "next/link";
import { useGrades } from "@/hooks/admin/useChapter";
import { useEditChapter } from "@/hooks/admin/useEditChapter";
import EditQuestionsSection from "@/components/admin/chapters/EditQuestionsSection";
import EditContentSection from "@/components/admin/chapters/EditContentSection";
import { LoadingState } from "@/components/shared/LoadingComponent";
export default function SuperAdminEditChapterPage() {
  const { id } = useParams() as { id: string };
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const {
    formState,
    errors,
    isLoading,
    fetchLoading,
    updateField,
    updateContentItems,
    updateQuestions,
    handleSubmit,
  } = useEditChapter(id);
  const units = formState.selectedGradeId
    ? grades.find((g) => g._id === formState.selectedGradeId)?.units || []
    : [];
  useEffect(() => {
    if (
      formState.selectedGradeId &&
      formState.selectedUnitId &&
      units.length > 0
    ) {
      const isUnitInGrade = units.some(
        (u) => u._id === formState.selectedUnitId,
      );
      if (!isUnitInGrade) {
        updateField("selectedUnitId", "");
      }
    }
  }, [formState.selectedGradeId, units, formState.selectedUnitId, updateField]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };
  if (fetchLoading || gradesLoading) {
    return <LoadingState text="chapter details" />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Edit Chapter</h1>
          <p className="text-indigo-100 text-lg">
            Update chapter content and assessment questions
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <EditContentSection
            title={formState.title}
            setTitle={(value) => updateField("title", value)}
            description={formState.description}
            setDescription={(value) => updateField("description", value)}
            selectedGradeId={formState.selectedGradeId}
            setSelectedGradeId={(value) =>
              updateField("selectedGradeId", value)
            }
            selectedUnitId={formState.selectedUnitId}
            setSelectedUnitId={(value) => updateField("selectedUnitId", value)}
            chapterNumber={formState.chapterNumber}
            setChapterNumber={(value) => updateField("chapterNumber", value)}
            grades={grades}
            units={units}
            contentItems={formState.contentItems}
            setContentItems={updateContentItems}
            errors={errors}
          />
          <EditQuestionsSection
            questions={formState.questions}
            setQuestions={(value) => {
              const newQuestions =
                typeof value === "function"
                  ? value(formState.questions)
                  : value;
              updateQuestions(newQuestions);
            }}
            errors={errors}
          />
          <div className="flex justify-end gap-6">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isLoading}
              className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
            >
              <Link href="/dashboard/super-admin/chapters">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Chapter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
