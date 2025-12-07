"use client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Save,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Video,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { QuestionForm } from "@/components/admin/assignments/QuestionForm";
interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}
interface Assignment {
  id: string;
  title: string;
  description: string;
  grade: string;
  contentType: "video" | "text" | "pdf";
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
  questions: IQuestion[];
}
const MAX_FILE_SIZE_MB = 25;
export default function TeacherEditAssignment() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [contentType, setContentType] = useState<"video" | "text" | "pdf">(
    "video"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [questions, setQuestions] = useState<IQuestion[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/assignments/${assignmentId}`);
        if (!response.data.success)
          throw new Error("Failed to fetch assignment");
        const assignmentData = response.data.data || response.data;
        setAssignment(assignmentData);
        setTitle(assignmentData.title || "");
        setDescription(assignmentData.description || "");
        setContentType(assignmentData.contentType || "video");
        setStartDate(assignmentData.startDate || "");
        setEndDate(assignmentData.endDate || "");
        setTotalMarks(assignmentData.totalMarks || 100);
        setPassingMarks(assignmentData.passingMarks || 40);
        setTextContent(assignmentData.textContent || "");
        if (assignmentData.questions && assignmentData.questions.length > 0) {
          setQuestions(
            assignmentData.questions.map((q: any) => ({
              questionText: q.questionText || q.question || "",
              options: q.options || ["", "", "", ""],
              correctAnswer: q.correctAnswer || "A",
            }))
          );
        }
        toast.success("Assignment loaded successfully");
      } catch (error: any) {
        console.error("Failed to fetch assignment:", error);
        toast.error(
          error.response?.data?.message || "Failed to load assignment"
        );
      } finally {
        setInitialLoading(false);
      }
    };
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrors({});
    try {
      if (
        contentType === "video" &&
        videoFile &&
        videoFile.size / (1024 * 1024) > MAX_FILE_SIZE_MB
      ) {
        toast.error(`Video file exceeds ${MAX_FILE_SIZE_MB}MB`);
        setLoading(false);
        return;
      }
      if (
        contentType === "pdf" &&
        pdfFile &&
        pdfFile.size / (1024 * 1024) > MAX_FILE_SIZE_MB
      ) {
        toast.error(`PDF file exceeds ${MAX_FILE_SIZE_MB}MB`);
        setLoading(false);
        return;
      }
      if (contentType === "text" && !textContent.trim()) {
        toast.error("Text content cannot be empty");
        setLoading(false);
        return;
      }
      const validQuestions = questions.filter(
        (q) => q.questionText.trim() !== ""
      );
      if (validQuestions.length === 0) {
        toast.error("Please add at least one valid question");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("title", title);
      formData.append("contentType", contentType);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("totalMarks", totalMarks.toString());
      formData.append("passingMarks", passingMarks.toString());
      formData.append("questions", JSON.stringify(validQuestions));
      if (contentType === "video" && videoFile) {
        formData.append("file", videoFile);
      }
      if (contentType === "pdf" && pdfFile) {
        formData.append("file", pdfFile);
      }
      if (contentType === "text") {
        formData.append("textContent", textContent);
      }
      const response = await api.put(
        `/teacher/assignments/${assignmentId}`,
        formData
      );
      if (!response.data.success) {
        throw new Error("Failed to update assignment");
      }
      setSuccess(true);
      toast.success("Assignment updated successfully!");
      router.push("/dashboard/teacher/assignments");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
          <Card className="shadow-2xl border-0 rounded-3xl">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-4 text-gray-600">Loading assignment...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
          <p className="text-slate-600 mb-4">
            The assignment you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/dashboard/teacher/assignments")}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 rounded-3xl shadow-2xl">
            <div className="max-w-5xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 mr-3" />
                <h1 className="text-3xl font-bold">Update Assignment</h1>
              </div>
              <p className="text-indigo-100 text-lg">
                Modify assignment details and questions
              </p>
            </div>
          </div>
        </div>
        {success && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Assignment updated successfully!
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
          {}
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-2xl">Assignment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Assignment Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12"
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Content Type *
                  </Label>
                  <Tabs
                    value={contentType}
                    onValueChange={(val: any) => setContentType(val)}
                  >
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger
                        value="video"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger
                        value="text"
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger
                        value="pdf"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what students will learn..."
                  required
                />
              </div>
              {}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="text-sm font-semibold">
                    Total Marks
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="0"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="passingMarks"
                    className="text-sm font-semibold"
                  >
                    Passing Marks
                  </Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    min="0"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {}
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardTitle>Content Upload</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {contentType === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="videoFile">
                    Video File (Max {MAX_FILE_SIZE_MB}MB)
                  </Label>
                  {assignment?.videoUrl && (
                    <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📹 Current: {assignment.videoUrl.split("/").pop()}
                      </p>
                    </div>
                  )}
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to keep existing video
                  </p>
                </div>
              )}
              {contentType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="textContent">Text Content *</Label>
                  <Textarea
                    id="textContent"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    placeholder="Enter assignment text..."
                    required
                  />
                </div>
              )}
              {contentType === "pdf" && (
                <div className="space-y-2">
                  <Label htmlFor="pdfFile">
                    PDF File (Max {MAX_FILE_SIZE_MB}MB)
                  </Label>
                  {assignment?.pdfUrl && (
                    <div className="mb-2 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        📄 Current: {assignment.pdfUrl.split("/").pop()}
                      </p>
                    </div>
                  )}
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to keep existing PDF
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {}
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-red-50">
              <CardTitle>Assessment Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <QuestionForm
                questions={questions}
                onQuestionsChange={setQuestions}
                errors={errors}
              />
            </CardContent>
          </Card>
          {}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
