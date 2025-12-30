"use client";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import QuestionsSection, {
  Question,
} from "@/components/admin/chapters/QuestionsSection";
import BasicInfoSection from "@/components/admin/chapters/BasicInfoSection";
import ContentUploadSection from "@/components/admin/chapters/ContentUploadSection";

interface Grade {
  _id: string;
  grade: string;
  units?: Array<{
    _id: string;
    name: string;
    description?: string;
    orderIndex: number;
  }>;
}

interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  file?: File;
}

export default function SuperAdminUploadChapter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [chapter, setChapter] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { type: "video", order: 0, title: "" }
  ]);
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradesRes = await api.get("/grades/all");
        setGrades(gradesRes.data.data || []);
      } catch (error) {
        toast.error("Failed to fetch grades");
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrades.length === 0) {
      setUnits([]);
      setSelectedUnit("");
      return;
    }
    const firstGradeId = selectedGrades[0];
    const selectedGrade = grades.find((g) => g._id === firstGradeId);
    if (selectedGrade?.units) {
      const sortedUnits = [...selectedGrade.units].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      setUnits(sortedUnits);
    } else {
      setUnits([]);
    }
    setSelectedUnit("");
  }, [selectedGrades, grades]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (selectedGrades.length === 0) {
      newErrors.gradeIds = "At least one grade must be selected";
    }

    if (!selectedUnit) {
      newErrors.unitId = "Unit is required";
    }

    if (chapter < 1) {
      newErrors.chapterNumber = "Chapter number must be at least 1";
    }

    if (contentItems.length === 0) {
      newErrors.contentItems = "At least one content item is required";
    } else {
      for (let i = 0; i < contentItems.length; i++) {
        const item = contentItems[i];
        
        // For mixed type, at least one of video or text should be provided
        if (item.type === "mixed") {
          const hasVideo = (item.videoUrl?.trim() || item.file);
          const hasText = item.textContent?.trim();
          if (!hasVideo && !hasText) {
            newErrors[`content_${i}`] = "Provide at least video or text content";
            break;
          }
        }
        
        // No validation for individual types since all are optional
        // Users can choose to add content later if needed
      }
    }

    if (questions.length === 0) {
      newErrors.questions = "At least one question is required";
    } else {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          newErrors.questions = `Question ${i + 1}: Question text is required`;
          break;
        }
        const filledOptions = q.options.filter((opt) => opt && opt.trim());
        if (q.options.length !== 4) {
          newErrors.questions = `Question ${i + 1}: Must have exactly 4 options`;
          break;
        }
        if (filledOptions.length < 2) {
          newErrors.questions = `Question ${i + 1}: At least 2 options must be filled`;
          break;
        }
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          newErrors.questions = `Question ${i + 1}: Please select a correct answer`;
          break;
        }
        if (!q.options.includes(q.correctAnswer)) {
          newErrors.questions = `Question ${i + 1}: Correct answer must be one of the options`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix all errors before submitting",
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.filter((opt) => opt && opt.trim()),
      correctAnswer: q.correctAnswer.trim(),
    }));

    try {
      const formData = new FormData();
      
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("unitId", selectedUnit);
      formData.append("chapterNumber", chapter.toString());
      formData.append("gradeIds", JSON.stringify(selectedGrades));
      
      const contentItemsData = contentItems.map((item, index) => ({
        type: item.type,
        order: index,
        title: item.title || "",
        ...(item.type === "text" && { textContent: item.textContent }),
        ...(item.type === "video" && item.videoUrl && { videoUrl: item.videoUrl }),
      }));
      
      formData.append("contentItems", JSON.stringify(contentItemsData));
      
      contentItems.forEach((item, index) => {
        if (item.file) {
          formData.append(`content_${index}`, item.file);
        }
      });
      
      formData.append("questions", JSON.stringify(formattedQuestions));

      await api.post("/chapters/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      toast.success("Content Uploaded!", {
        description: `Your educational content has been uploaded to ${selectedGrades.length} grade(s).`,
      });

      setTimeout(() => {
        router.push("/dashboard/super-admin/chapters");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "An error occurred during upload.";
      toast.error("Upload Failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

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
        {success && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              Content uploaded successfully! Students can now access this material.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInfoSection
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            selectedGrades={selectedGrades}
            setSelectedGrades={setSelectedGrades}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            chapter={chapter}
            setChapter={setChapter}
            grades={grades}
            units={units}
            errors={errors}
          />

          <ContentUploadSection
            contentItems={contentItems}
            setContentItems={setContentItems}
            errors={errors}
          />

          <QuestionsSection
            questions={questions}
            setQuestions={setQuestions}
            errors={errors}
          />

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              asChild
              className="px-6 sm:px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl w-full sm:w-auto transition-all duration-300"
            >
              <Link href="/dashboard/super-admin/chapters">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 sm:px-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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