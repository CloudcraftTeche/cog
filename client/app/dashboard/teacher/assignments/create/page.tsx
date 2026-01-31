"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  Video,
  FileText,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  IAssignment,
  IQuestion,
  IValidationError,
} from "@/lib/assignmentValidation";
import { QuestionForm } from "@/components/admin/assignments/QuestionForm";
const MAX_FILE_SIZE_MB = 25;
export interface IGrade {
  _id: string;
  grade: string;
  description?: string;
  isActive: boolean;
  assignments?: IAssignment[];
}
export interface IAssignmentForm {
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  videoFile?: File | null;
  pdfFile?: File | null;
  textContent?: string;
  startDate: string;
  endDate: string;
  totalMarks?: number;
  passingMarks?: number;
  questions: IQuestion[];
}
export default function TeacherCreateAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gradeName, setGradeName] = useState<string>("");
  const [formData, setFormData] = useState<IAssignmentForm>({
    title: "",
    description: "",
    contentType: "video",
    videoFile: null,
    pdfFile: null,
    textContent: "",
    startDate: "",
    endDate: "",
    totalMarks: 100,
    passingMarks: 40,
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "A",
      },
    ],
  });
  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await api.get("/auth/me");
        const gradeId = response.data.data.gradeId;
        setGradeName(gradeId.grade);
      } catch (error) {
        toast.error("Failed to fetch grade information");
      }
    };
    fetchGrade();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAssignmentForm(formData);
    if (validationErrors.length > 0) {
      const errorObj: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorObj[err.field] = err.message;
      });
      setErrors(errorObj);
      toast.error("Please fix the form errors");
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("contentType", formData.contentType);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append(
        "totalMarks",
        formData.totalMarks?.toString() || "100",
      );
      formDataToSend.append(
        "passingMarks",
        formData.passingMarks?.toString() || "40",
      );
      const validQuestions = formData.questions.filter(
        (q) => q.questionText?.trim() !== "",
      );
      formDataToSend.append("questions", JSON.stringify(validQuestions));
      if (formData.contentType === "video" && formData.videoFile) {
        formDataToSend.append("file", formData.videoFile);
      } else if (formData.contentType === "pdf" && formData.pdfFile) {
        formDataToSend.append("file", formData.pdfFile);
      } else if (formData.contentType === "text") {
        formDataToSend.append("textContent", formData.textContent || "");
      }
      await api.post("/assignments", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Assignment created successfully");
      router.push("/dashboard/teacher/assignments");
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to create assignment",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-h-[100vh] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
                <h1 className="text-3xl font-bold">Create Assignment</h1>
              </div>
              <p className="text-indigo-100 text-lg">
                {gradeName
                  ? `Creating assignment for Grade ${gradeName}`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto space-y-8 pb-8"
        >
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
                    className={`h-12 ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter assignment title"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600">{errors.title}</p>
                  )}
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`${errors.description ? "border-red-500" : ""}`}
                  rows={4}
                  placeholder="Describe what students will learn..."
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description}</p>
                )}
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
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-600">{errors.startDate}</p>
                  )}
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
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-600">{errors.endDate}</p>
                  )}
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
                    Video File * (Max {MAX_FILE_SIZE_MB}MB)
                  </Label>
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
                    className={errors.videoFile ? "border-red-500" : ""}
                  />
                  {formData.videoFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {formData.videoFile.name} (
                      {(formData.videoFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </p>
                  )}
                  {errors.videoFile && (
                    <p className="text-xs text-red-600">{errors.videoFile}</p>
                  )}
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
                    className={errors.textContent ? "border-red-500" : ""}
                    rows={12}
                    placeholder="Enter assignment text..."
                  />
                  {errors.textContent && (
                    <p className="text-xs text-red-600">{errors.textContent}</p>
                  )}
                </div>
              )}
              {formData.contentType === "pdf" && (
                <div className="space-y-2">
                  <Label htmlFor="pdfFile">
                    PDF File * (Max {MAX_FILE_SIZE_MB}MB)
                  </Label>
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
                    className={errors.pdfFile ? "border-red-500" : ""}
                  />
                  {formData.pdfFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {formData.pdfFile.name} (
                      {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </p>
                  )}
                  {errors.pdfFile && (
                    <p className="text-xs text-red-600">{errors.pdfFile}</p>
                  )}
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
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
const validateAssignmentForm = (form: IAssignmentForm): IValidationError[] => {
  const errors: IValidationError[] = [];
  if (!form.title || form.title?.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (form.title.length < 3) {
    errors.push({
      field: "title",
      message: "Title must be at least 3 characters",
    });
  } else if (form.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title cannot exceed 200 characters",
    });
  }
  if (!form.description || form.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" });
  } else if (form.description.length < 10) {
    errors.push({
      field: "description",
      message: "Description must be at least 10 characters",
    });
  }
  if (!form.startDate) {
    errors.push({ field: "startDate", message: "Start date is required" });
  }
  if (!form.endDate) {
    errors.push({ field: "endDate", message: "End date is required" });
  }
  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      errors.push({
        field: "endDate",
        message: "End date must be after start date",
      });
    }
  }
  if (form.contentType === "video" && !form.videoFile) {
    errors.push({ field: "videoFile", message: "Video file is required" });
  }
  if (form.contentType === "pdf" && !form.pdfFile) {
    errors.push({ field: "pdfFile", message: "PDF file is required" });
  }
  if (
    form.contentType === "text" &&
    (!form.textContent || form.textContent.trim().length === 0)
  ) {
    errors.push({ field: "textContent", message: "Text content is required" });
  }
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  if (form.videoFile && form.videoFile.size > MAX_FILE_SIZE) {
    errors.push({
      field: "videoFile",
      message: `Video file size exceeds 25MB (${(
        form.videoFile.size /
        (1024 * 1024)
      ).toFixed(2)}MB)`,
    });
  }
  if (form.pdfFile && form.pdfFile.size > MAX_FILE_SIZE) {
    errors.push({
      field: "pdfFile",
      message: `PDF file size exceeds 25MB (${(
        form.pdfFile.size /
        (1024 * 1024)
      ).toFixed(2)}MB)`,
    });
  }
  if (form.totalMarks !== undefined && form.totalMarks < 0) {
    errors.push({
      field: "totalMarks",
      message: "Total marks cannot be negative",
    });
  }
  if (form.passingMarks !== undefined && form.passingMarks < 0) {
    errors.push({
      field: "passingMarks",
      message: "Passing marks cannot be negative",
    });
  }
  if (
    form.totalMarks !== undefined &&
    form.passingMarks !== undefined &&
    form.passingMarks > form.totalMarks
  ) {
    errors.push({
      field: "passingMarks",
      message: "Passing marks cannot exceed total marks",
    });
  }
  if (!form.questions || form.questions.length === 0) {
    errors.push({
      field: "questions",
      message: "At least one question is required",
    });
  } else {
    form.questions.forEach((q, index) => {
      if (!q.questionText || q.questionText?.trim().length === 0) {
        errors.push({
          field: `questions[${index}].questionText`,
          message: `Question ${index + 1}: Question text is required`,
        });
      }
      const validOptions = q.options.filter(
        (opt: string) => opt?.trim().length > 0,
      );
      if (validOptions.length < 2) {
        errors.push({
          field: `questions[${index}].options`,
          message: `Question ${index + 1}: At least 2 options are required`,
        });
      }
      if (!q.correctAnswer) {
        errors.push({
          field: `questions[${index}].correctAnswer`,
          message: `Question ${index + 1}: Correct answer must be selected`,
        });
      }
    });
  }
  return errors;
};
