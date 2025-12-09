"use client";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Upload, Video, BookOpen, Sparkles } from "lucide-react";
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
export default function SuperAdminUploadChapter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [contentType, setContentType] = useState<"video" | "text">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [chapter, setChapter] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
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
          newErrors.questions = `Question ${
            i + 1
          }: Must have exactly 4 options`;
          hasInvalidQuestion = true;
          break;
        }
        if (filledOptions.length < 2) {
          newErrors.questions = `Question ${
            i + 1
          }: At least 2 options must be filled`;
          hasInvalidQuestion = true;
          break;
        }
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          newErrors.questions = `Question ${
            i + 1
          }: Please select a correct answer`;
          hasInvalidQuestion = true;
          break;
        }
        if (!q.options.includes(q.correctAnswer)) {
          newErrors.questions = `Question ${
            i + 1
          }: Correct answer must be one of the options`;
          hasInvalidQuestion = true;
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
      };
      await api.post("/chapters/bulk", payload, {
        headers: { "Content-Type": "application/json" },
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
              Content uploaded successfully! Students can now access this
              material.
            </AlertDescription>
          </Alert>
        )}
        <Tabs
          value={contentType}
          onValueChange={(val: string) =>
            setContentType(val as "video" | "text")
          }
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-2">
              <TabsTrigger
                value="video"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Video className="w-5 h-5" />{" "}
                <span className="font-medium">Video Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />{" "}
                <span className="font-medium">Text Content</span>
              </TabsTrigger>
            </TabsList>
          </div>
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
            <TabsContent value="video" className="space-y-8 mt-0">
              <ContentUploadSection
                contentType="video"
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                textContent=""
                setTextContent={() => {}}
                errors={errors}
              />
            </TabsContent>
            <TabsContent value="text" className="space-y-8 mt-0">
              <ContentUploadSection
                contentType="text"
                videoUrl=""
                setVideoUrl={() => {}}
                textContent={textContent}
                setTextContent={setTextContent}
                errors={errors}
              />
            </TabsContent>
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
        </Tabs>
      </div>
    </div>
  );
}
