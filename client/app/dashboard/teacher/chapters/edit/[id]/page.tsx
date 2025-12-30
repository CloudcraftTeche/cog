"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import EditQuestionsSection, {
  EditQuestion,
} from "@/components/admin/chapters/EditQuestionsSection";
import {
  TeacherChapterService,
  TeacherGrade,
} from "@/components/teacher/chapter/chapterApiAndTypes";
import TeacherEditContentSection from "@/components/teacher/chapter/TeacherEditContentSection";

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
  url?: string;
  publicId?: string | null;
  file?: File;
}

export default function TeacherEditChapterPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);

  const [grade, setGrade] = useState<TeacherGrade | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { type: "video", order: 0, title: "" }
  ]);
  
  const [questions, setQuestions] = useState<EditQuestion[]>([
    { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id || !user?.id) return;

    const fetchData = async () => {
      try {
        setFetchLoading(true);

        const gradeData = await TeacherChapterService.getTeacherGrade(user.id);
        setGrade(gradeData);
        
        if (gradeData?.units) {
          const sortedUnits = [...gradeData.units].sort(
            (a, b) => a.orderIndex - b.orderIndex
          );
          setUnits(sortedUnits);
        }

        const chapter = await TeacherChapterService.getChapterById(id);

        if (chapter.gradeId._id !== gradeData._id) {
          toast.error("Unauthorized", {
            description: "You can only edit chapters from your assigned grade",
          });
          router.push("/dashboard/teacher/chapters");
          return;
        }

        setTitle(chapter.title || "");
        setDescription(chapter.description || "");
        setSelectedUnitId(chapter.unitId || "");
        setChapterNumber(chapter.chapterNumber || 1);

        if (chapter.contentItems && chapter.contentItems.length > 0) {
          const formattedContent = chapter.contentItems.map((item: any, index: number) => ({
            type: item.type,
            order: item.order !== undefined ? item.order : index,
            title: item.title || "",
            textContent: item.textContent || "",
            videoUrl: item.type === "video" ? (item.url || "") : "",
            url: item.url || "",
            publicId: item.publicId || null,
          }));
          setContentItems(formattedContent);
        } else {
          // Fallback to old format
          setContentItems([{
            type: chapter.contentType || "text",
            order: 0,
            title: "",
            textContent: chapter.textContent || "",
            videoUrl: chapter.videoUrl || "",
          }]);
        }

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
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Failed to fetch chapter data");
        router.push("/dashboard/teacher/chapters");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id, router]);

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

    if (!selectedUnitId) {
      newErrors.unitId = "Unit is required";
    }

    if (chapterNumber < 1) {
      newErrors.chapterNumber = "Chapter number must be at least 1";
    }

    if (contentItems.length === 0) {
      newErrors.contentItems = "At least one content item is required";
    } else {
      for (let i = 0; i < contentItems.length; i++) {
        const item = contentItems[i];
        
        if (item.type === "mixed") {
          const hasVideo = (item.videoUrl?.trim() || item.url?.trim() || item.file);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("unitId", selectedUnitId);
      formData.append("chapterNumber", chapterNumber.toString());

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

      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.filter((opt) => opt && opt.trim()),
        correctAnswer: q.correctAnswer.trim(),
      }));
      
      formData.append("questions", JSON.stringify(formattedQuestions));

      await TeacherChapterService.updateChapter(id, formData);

      toast.success("Chapter updated successfully", {
        description: "The chapter has been updated with your changes",
      });

      router.push("/dashboard/teacher/chapters");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update chapter";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-lg text-gray-600">
                  Loading chapter details...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!grade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Edit Chapter</h1>
          <p className="text-indigo-100 text-lg">
            Update chapter content and assessment questions for Grade {grade.grade}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <TeacherEditContentSection
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            selectedUnitId={selectedUnitId}
            setSelectedUnitId={setSelectedUnitId}
            chapterNumber={chapterNumber}
            setChapterNumber={setChapterNumber}
            grade={grade}
            units={units}
            contentItems={contentItems}
            setContentItems={setContentItems}
            errors={errors}
          />

          <EditQuestionsSection
            questions={questions}
            setQuestions={setQuestions}
            errors={errors}
          />

          <div className="flex justify-end gap-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
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