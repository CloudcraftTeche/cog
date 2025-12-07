"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, BookOpen, Video } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import EditQuestionsSection, {
  EditQuestion,
} from "@/components/admin/chapters/EditQuestionsSection";
import EditContentSection from "@/components/admin/chapters/EditContentSection";
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
export default function EditTeacherChapterPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"video" | "text">("text");
  const [videoUrl, setVideoUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [questions, setQuestions] = useState<EditQuestion[]>([
    {
      id: "1",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!selectedGradeId || grades.length === 0) {
      setUnits([]);
      return;
    }
    const selectedGrade = grades.find((g) => g._id === selectedGradeId);
    if (selectedGrade?.units) {
      const sortedUnits = [...selectedGrade.units].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      setUnits(sortedUnits);
    } else {
      setUnits([]);
    }
  }, [selectedGradeId, grades]);
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const gradesRes = await api.get("/grades/all");
        const gradesData = gradesRes.data.data || [];
        const sortedGrades = gradesData.sort((a: Grade, b: Grade) => {
          const gradeA = parseInt(a.grade.replace(/\D/g, "")) || 0;
          const gradeB = parseInt(b.grade.replace(/\D/g, "")) || 0;
          return gradeA - gradeB;
        });
        setGrades(sortedGrades);
        const { data } = await api.get(`/teacher-chapters/${id}`);
        const chapter = data.data;
        setTitle(chapter.title || "");
        setDescription(chapter.description || "");
        setContentType(chapter.contentType || "text");
        setTextContent(chapter.textContent || "");
        setVideoUrl(chapter.videoUrl || "");
        const gradeId = chapter.gradeId?._id || chapter.gradeId || "";
        setSelectedGradeId(gradeId);
        setSelectedUnitId(chapter.unitId?._id || chapter.unitId || "");
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
      } catch (error: any) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to fetch chapter data"
        );
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id]);
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
    if (!selectedGradeId) {
      newErrors.gradeId = "Grade is required";
    }
    if (!selectedUnitId) {
      newErrors.unitId = "Unit is required";
    }
    if (chapterNumber < 1) {
      newErrors.chapterNumber = "Chapter number must be at least 1";
    }
    if (contentType === "video") {
      if (!videoUrl.trim()) {
        newErrors.videoUrl = "Video URL is required for video content";
      } else {
        try {
          new URL(videoUrl);
        } catch {
          newErrors.videoUrl = "Please enter a valid URL";
        }
      }
    }
    if (contentType === "text") {
      if (!textContent.trim()) {
        newErrors.textContent =
          "Text content is required for text content type";
      }
    }
    if (questions.length === 0) {
      newErrors.questions = "At least one question is required";
    } else {
      let hasInvalidQuestion = false;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          newErrors.questions = `Question ${i + 1}: Question text is required`;
          hasInvalidQuestion = true;
          break;
        }
        const filledOptions = q.options.filter((opt) => opt && opt.trim());
        if (q.options.length !== 4) {
          newErrors.questions = `Question ${i + 1}: Must have exactly 4 options`;
          hasInvalidQuestion = true;
          break;
        }
        if (filledOptions.length < 2) {
          newErrors.questions = `Question ${i + 1}: At least 2 options must be filled`;
          hasInvalidQuestion = true;
          break;
        }
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          newErrors.questions = `Question ${i + 1}: Please select a correct answer`;
          hasInvalidQuestion = true;
          break;
        }
        if (!q.options.includes(q.correctAnswer)) {
          newErrors.questions = `Question ${i + 1}: Correct answer must be one of the options`;
          hasInvalidQuestion = true;
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
      if (
        errors.title ||
        errors.description ||
        errors.gradeId ||
        errors.unitId ||
        errors.chapterNumber ||
        errors.videoUrl ||
        errors.textContent
      ) {
        setActiveTab("content");
      } else if (errors.questions) {
        setActiveTab("questions");
      }
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        contentType,
        unitId: selectedUnitId,
        chapterNumber,
        videoUrl: contentType === "video" ? videoUrl.trim() : undefined,
        textContent: contentType === "text" ? textContent.trim() : undefined,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.filter((opt) => opt && opt.trim()),
          correctAnswer: q.correctAnswer.trim(),
        })),
      };
      await api.put(`/teacher-chapters/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Chapter updated successfully", {
        description: "The chapter has been updated with your changes",
      });
      router.push("/dashboard/admin/teacher-chapters");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Failed to update chapter";
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Edit Chapter</h1>
          <p className="text-indigo-100 text-lg">
            Update chapter content and assessment questions
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-16 bg-white rounded-2xl shadow-xl border-0 p-2">
              <TabsTrigger
                value="content"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <BookOpen className="w-5 h-5" /> <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <Video className="w-5 h-5" /> <span>Questions</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <TabsContent value="content" className="space-y-8">
              <EditContentSection
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
                grades={grades}
                units={units}
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="questions" className="space-y-8">
              <EditQuestionsSection
                questions={questions}
                setQuestions={setQuestions}
                errors={errors}
              />
            </TabsContent>
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
        </Tabs>
      </div>
    </div>
  );
}
