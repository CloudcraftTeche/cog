"use client";

import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import QuestionsSection, {
  Question,
} from "@/components/admin/chapters/QuestionsSection";
import ContentUploadSection from "@/components/admin/chapters/ContentUploadSection";
import {
  TeacherChapterService,
  TeacherGrade,
} from "@/components/teacher/chapter/chapterApiAndTypes";

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

export default function TeacherCreateChapterPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapter, setChapter] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState("");

  const [grade, setGrade] = useState<TeacherGrade | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { type: "video", order: 0, title: "" }
  ]);
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchGrade = async () => {
      try {
        const gradeData = await TeacherChapterService.getTeacherGrade(user.id);
        setGrade(gradeData);
        
        // Set units from the grade data
        if (gradeData?.units) {
          const sortedUnits = [...gradeData.units].sort(
            (a, b) => a.orderIndex - b.orderIndex
          );
          setUnits(sortedUnits);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch grade");
      }
    };

    fetchGrade();
  }, [user?.id]);

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
      const formData:any = new FormData();
      
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("unitId", selectedUnit);
      formData.append("chapterNumber", chapter.toString());
      
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

      await TeacherChapterService.createChapter(formData);

      setSuccess(true);
      toast.success("Content Uploaded!", {
        description: "Your educational content has been uploaded successfully.",
      });

      setTimeout(() => {
        router.push("/dashboard/teacher/chapters");
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

  if (!grade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Create Educational Content</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Grade {grade.grade} - Create engaging lessons and assessments
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
          {/* Basic Info Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-slate-200">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Algebra"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.title ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief description of this chapter..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.description ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Grade
                  </label>
                  <div className="px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-700 font-medium">
                    Grade {grade.grade}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Chapter Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={chapter}
                    onChange={(e) => setChapter(parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      errors.chapterNumber ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.chapterNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.chapterNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Unit *
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.unitId ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  <option value="">Choose a unit...</option>
                  {units.map((unit) => (
                    <option key={unit._id} value={unit._id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>
                )}
              </div>
            </div>
          </div>

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
              <Link href="/dashboard/teacher/chapters">Cancel</Link>
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