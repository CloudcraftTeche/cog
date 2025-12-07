"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { toast } from "sonner";
import api from "@/lib/api";
import { IQuestion } from "@/lib/assignmentValidation";
import { QuestionForm } from "@/components/admin/assignments/QuestionForm";
interface Assignment {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
  questions: IQuestion[];
  gradeId: string;
  gradeName: string;
}
const MAX_FILE_SIZE_MB = 25;
export default function AdminEditAssignment() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "video" as "video" | "text" | "pdf",
    videoFile: null as File | null,
    pdfFile: null as File | null,
    textContent: "",
    startDate: "",
    endDate: "",
    totalMarks: 100,
    passingMarks: 40,
    questions: [] as IQuestion[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/assignments/${assignmentId}`);
        if (!response.data.success && !response.data._id) {
          throw new Error("Failed to fetch assignment");
        }
        const assignmentData = response.data.data || response.data;
        setAssignment(assignmentData);
        setFormData({
          title: assignmentData.title || "",
          description: assignmentData.description || "",
          contentType: assignmentData.contentType || "video",
          videoFile: null,
          pdfFile: null,
          textContent: assignmentData.textContent || "",
          startDate: assignmentData.startDate
            ? assignmentData.startDate.split("T")[0]
            : "",
          endDate: assignmentData.endDate
            ? assignmentData.endDate.split("T")[0]
            : "",
          totalMarks: assignmentData.totalMarks || 100,
          passingMarks: assignmentData.passingMarks || 40,
          questions: (assignmentData.questions || []).map((q: any) => ({
            questionText: q.questionText || "",
            options: q.options || ["", "", "", ""],
            correctAnswer: q.correctAnswer || "A",
            _id: q._id,
          })),
        });
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
        formData.contentType === "video" &&
        formData.videoFile &&
        formData.videoFile.size / (1024 * 1024) > MAX_FILE_SIZE_MB
      ) {
        toast.error(`Video file exceeds ${MAX_FILE_SIZE_MB}MB`);
        setLoading(false);
        return;
      }
      if (
        formData.contentType === "pdf" &&
        formData.pdfFile &&
        formData.pdfFile.size / (1024 * 1024) > MAX_FILE_SIZE_MB
      ) {
        toast.error(`PDF file exceeds ${MAX_FILE_SIZE_MB}MB`);
        setLoading(false);
        return;
      }
      if (formData.contentType === "text" && !formData.textContent.trim()) {
        toast.error("Text content cannot be empty");
        setLoading(false);
        return;
      }
      const validQuestions = formData.questions.filter(
        (q) => q.questionText.trim() !== ""
      );
      if (validQuestions.length === 0) {
        toast.error("Please add at least one valid question");
        setLoading(false);
        return;
      }
      const updateFormData = new FormData();
      updateFormData.append("title", formData.title);
      updateFormData.append("contentType", formData.contentType);
      updateFormData.append("description", formData.description);
      updateFormData.append("startDate", formData.startDate);
      updateFormData.append("endDate", formData.endDate);
      updateFormData.append("totalMarks", formData.totalMarks.toString());
      updateFormData.append("passingMarks", formData.passingMarks.toString());
      updateFormData.append("questions", JSON.stringify(validQuestions));
      if (formData.contentType === "video" && formData.videoFile) {
        updateFormData.append("file", formData.videoFile);
      }
      if (formData.contentType === "pdf" && formData.pdfFile) {
        updateFormData.append("file", formData.pdfFile);
      }
      if (formData.contentType === "text") {
        updateFormData.append("textContent", formData.textContent);
      }
      const response = await api.put(
        `/assignments/${assignmentId}`,
        updateFormData
      );
      if (!response.data.success) {
        throw new Error("Failed to update assignment");
      }
      setSuccess(true);
      toast.success("Assignment updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/admin/assignments");
      }, 1500);
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to update assignment"
      );
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
          <Button onClick={() => router.push("/dashboard/admin/assignments")}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Grade {assignment.gradeName} - {assignment.title}
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
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-8">
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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
                    value={formData.contentType}
                    onValueChange={(val: any) =>
                      setFormData({ ...formData, contentType: val })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger
                        value="video"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger value="pdf" className="flex items-center gap-2">
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
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
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
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
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalMarks: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingMarks" className="text-sm font-semibold">
                    Passing Marks
                  </Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    min="0"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingMarks: Number(e.target.value),
                      })
                    }
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
              {formData.contentType === "video" && (
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        videoFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to keep existing video
                  </p>
                </div>
              )}
              {formData.contentType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="textContent">Text Content *</Label>
                  <Textarea
                    id="textContent"
                    value={formData.textContent}
                    onChange={(e) =>
                      setFormData({ ...formData, textContent: e.target.value })
                    }
                    rows={12}
                    placeholder="Enter assignment text..."
                    required
                  />
                </div>
              )}
              {formData.contentType === "pdf" && (
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pdfFile: e.target.files?.[0] || null,
                      })
                    }
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
                questions={formData.questions}
                onQuestionsChange={(questions) =>
                  setFormData({ ...formData, questions })
                }
                errors={errors}
              />
            </CardContent>
          </Card>
          {}
          <div className="flex justify-end gap-4 pb-8">
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