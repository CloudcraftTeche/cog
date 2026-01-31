"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import { useGrades } from "@/hooks/admin/useChapter";
import { useUploadChapter } from "@/hooks/admin/useUploadChapter";
import QuestionsSection from "@/components/admin/chapters/QuestionsSection";
import BasicInfoSection from "@/components/admin/chapters/BasicInfoSection";
import ContentUploadSection from "@/components/admin/chapters/ContentUploadSection";
import { LoadingState } from "@/components/shared/LoadingComponent";
export default function SuperAdminUploadChapter() {
  const router = useRouter();
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const {
    formState,
    errors,
    isLoading,
    isSuccess,
    updateField,
    updateContentItems,
    updateQuestions,
    handleSubmit,
  } = useUploadChapter();
  const units =
    formState.selectedGrades.length > 0
      ? grades.find((g) => g._id === formState.selectedGrades[0])?.units || []
      : [];
  useEffect(() => {
    if (formState.selectedGrades.length === 0) {
      updateField("selectedUnit", "");
    } else {
      const firstGradeId = formState.selectedGrades[0];
      const selectedGrade = grades.find((g) => g._id === firstGradeId);
      if (selectedGrade?.units) {
        const sortedUnits = [...selectedGrade.units].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );
        if (
          formState.selectedUnit &&
          !sortedUnits.some((u) => u._id === formState.selectedUnit)
        ) {
          updateField("selectedUnit", "");
        }
      }
    }
  }, [formState.selectedGrades, grades, formState.selectedUnit, updateField]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };
  if (gradesLoading) {
    return <LoadingState text="form" />;
  }
  return (
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Upload Educational Content</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Create engaging lessons and assessments for your students
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
        {isSuccess && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              Content uploaded successfully! Students can now access this
              material.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <BasicInfoSection
            title={formState.title}
            setTitle={(value) => updateField("title", value)}
            description={formState.description}
            setDescription={(value) => updateField("description", value)}
            selectedGrades={formState.selectedGrades}
            setSelectedGrades={(value) => updateField("selectedGrades", value)}
            selectedUnit={formState.selectedUnit}
            setSelectedUnit={(value) => updateField("selectedUnit", value)}
            chapter={formState.chapter}
            setChapter={(value) => updateField("chapter", value)}
            grades={grades}
            units={units}
            errors={errors}
          />
          <ContentUploadSection
            contentItems={formState.contentItems}
            setContentItems={updateContentItems}
            errors={errors}
          />
          <QuestionsSection
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
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              asChild
              className="px-6 sm:px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl w-full sm:w-auto transition-all duration-300"
            >
              <Link href="/dashboard/admin/chapters">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 sm:px-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-3" />
                  Upload Content & Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
