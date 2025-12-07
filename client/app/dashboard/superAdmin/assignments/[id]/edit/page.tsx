"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  Video,
  FileUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import api from "@/lib/api";

interface Question {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
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
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
  questions: Question[];
}

export default function UpdateAssignment() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  const [contentType, setContentType] = useState<"video" | "text" | "pdf">(
    "video"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [grades, setGrades] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      questionText: "",
      options: [
        { label: "A", text: "" },
        { label: "B", text: "" },
        { label: "C", text: "" },
        { label: "D", text: "" },
      ],
      correctAnswer: "A",
    },
  ]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/assignment/${assignmentId}`);
        if (!response.data.success)
          throw new Error("Failed to fetch assignment");

        const assignmentData = response.data.data || response.data;

        setAssignment(assignmentData);
        setTitle(assignmentData.title || "");
        setDescription(assignmentData.description || "");
        setGrade(assignmentData.grade || "");
        setContentType(assignmentData.contentType || "video");
        setStartDate(assignmentData.startDate || "");
        setEndDate(assignmentData.endDate || "");
        setTextContent(assignmentData.textContent || "");

        if (assignmentData.questions && assignmentData.questions.length > 0) {
          setQuestions(
            assignmentData.questions.map((q: any, index: number) => ({
              id: q.id || index.toString(),
              questionText: q.questionText || q.question || "",
              options: q.options || [
                { label: "A", text: "" },
                { label: "B", text: "" },
                { label: "C", text: "" },
                { label: "D", text: "" },
              ],
              correctAnswer: q.correctAnswer || "A",
            }))
          );
        }

        toast.success("Assignment loaded successfully");
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
        toast.error("Failed to load assignment", {
          description: "Could not load assignment data. Please try again.",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchGrades = async () => {
      try {
        const response = await api.get("/grades/all");
        setGrades(response.data.data || response.data);
      } catch (error) {
        toast.error("Failed to fetch grades", {
          description: "Could not load available grade levels.",
        });
      }
    };

    if (assignmentId) {
      Promise.all([fetchAssignment(), fetchGrades()]);
    }
    
  }, [assignmentId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        questionText: "",
        options: [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ],
        correctAnswer: "A",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    } else {
      toast.warning("Cannot remove last question", {
        description: "You must have at least one question.",
      });
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qId: string, label: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.label === label ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (json.length < 2) {
          toast.error("Excel Import Error", {
            description:
              "No data found in the Excel file. Please ensure it has at least a header and one row of data.",
          });
          return;
        }

        const headerRow = json[0];
        const questionColIndex = headerRow.indexOf("Question");
        const correctAnswerColIndex = headerRow.indexOf("Correct Answer");

        if (questionColIndex === -1 || correctAnswerColIndex === -1) {
          toast.error("Excel Format Error", {
            description:
              "Missing 'Question' or 'Correct Answer' column in the Excel header.",
          });
          return;
        }

        const newQuestions: Question[] = [];
        const labels = ["A", "B", "C", "D"];

        json.slice(1).forEach((row, rowIndex) => {
          const questionText = row[questionColIndex]?.toString().trim() || "";
          const correctAnswerLabel =
            row[correctAnswerColIndex]?.toString().trim().toUpperCase() || "";
          const optionsFromExcel: string[] = [];

          for (let i = questionColIndex + 1; i < correctAnswerColIndex; i++) {
            if (
              row[i] !== undefined &&
              row[i] !== null &&
              row[i].toString().trim() !== ""
            ) {
              optionsFromExcel.push(row[i].toString().trim());
            }
          }

          const fixedOptions: string[] = Array(4).fill("");
          optionsFromExcel.slice(0, 4).forEach((opt, idx) => {
            fixedOptions[idx] = opt;
          });

          if (
            !questionText ||
            fixedOptions.filter(Boolean).length < 1 ||
            !correctAnswerLabel
          ) {
            toast.warning("Skipping Row", {
              description: `Row ${
                rowIndex + 2
              } was skipped due to missing question text, options, or correct answer.`,
            });
            return;
          }

          let correctAnswerIndex = labels.indexOf(correctAnswerLabel);
          if (
            correctAnswerIndex === -1 ||
            correctAnswerIndex >= fixedOptions.length
          ) {
            toast.warning("Adjusting Correct Answer", {
              description: `Row ${
                rowIndex + 2
              }: Correct answer '${correctAnswerLabel}' is invalid or out of bounds for 4 options. Defaulting to Option A.`,
            });
            correctAnswerIndex = 0;
          }

          newQuestions.push({
            id: Date.now().toString() + rowIndex,
            questionText: questionText,
            options: fixedOptions.map((text, index) => ({
              label: labels[index],
              text,
            })),
            correctAnswer: correctAnswerIndex.toString(),
          });
        });

        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          toast.success("Excel Imported", {
            description: `${newQuestions.length} questions loaded from Excel.`,
          });
        } else {
          toast.warning("No Valid Questions", {
            description:
              "No valid questions could be extracted from the Excel file. Please check the format.",
          });
        }
      } catch (error) {
        toast.error("Excel Import Error", {
          description:
            "Failed to read Excel file. Please ensure it's a valid .xlsx or .xls file.",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const MAX_FILE_SIZE_MB = 200;

  const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error("File Too Large", {
        description: `File size (${fileSizeMB.toFixed(
          2
        )}MB) exceeds the maximum limit of ${maxSizeMB}MB.`,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (
        contentType === "video" &&
        videoFile &&
        !validateFileSize(videoFile, MAX_FILE_SIZE_MB)
      ) {
        setLoading(false);
        return;
      }

      if (
        contentType === "pdf" &&
        pdfFile &&
        !validateFileSize(pdfFile, MAX_FILE_SIZE_MB)
      ) {
        setLoading(false);
        return;
      }

      if (contentType === "text" && !textContent.trim()) {
        toast.error("Validation Error", {
          description: "Text content cannot be empty.",
        });
        setLoading(false);
        return;
      }

      const labels = ["A", "B", "C", "D"];
      const formattedQuestions = questions
        .map((q) => {
          const trimmedOptions = q.options.filter(
            (opt) => opt.text.trim() !== ""
          );
          if (!q.questionText.trim() || trimmedOptions.length < 1) return null;
          return {
            questionText: q.questionText.trim(),
            options: trimmedOptions.map((text, i) => ({
              label: labels[i],
              text,
            })),
            correctAnswer: labels[Number(q.correctAnswer)],
          };
        })
        .filter(Boolean);

      if (formattedQuestions.length === 0) {
        toast.error("Validation Error", {
          description: "Please add at least one valid question.",
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("grade", grade);
      formData.append("contentType", contentType);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            id: q.id,
          }))
        )
      );

      if (contentType === "video" && videoFile) {
        formData.append("file", videoFile);
      }
      if (contentType === "pdf" && pdfFile) {
        formData.append("file", pdfFile);
      }
      if (contentType === "text") {
        formData.append("textContent", textContent);
      }

      const response = await api.put(`/assignment/${assignmentId}`, formData);

      if (!response.data.success) {
        throw new Error("Failed to update assignment");
      }

      setSuccess(true);
      toast.success("Assignment Updated!", {
        description: "Assignment & quiz updated successfully.",
      });

      router.push("/dashboard/admin/assignments");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error("Update Failed", {
        description: err.message || "An error occurred during update.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Update Assignment
            </h1>
            <p className="text-gray-600">Loading assignment details...</p>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
          <p className="text-slate-600 mb-4">
            The assignment you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/dashboard/admin/assignments">Back to Assignments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {success && (
          <Alert className="mb-8 border-green-200 bg-green-50/50 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Assignment updated successfully! Changes have been saved.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger
                value="content"
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" /> <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center space-x-2"
              >
                <Video className="w-4 h-4" /> <span>Questions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <TabsContent value="content" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      Basic Info
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Assignment Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter assignment title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade Level *</Label>
                      <Select
                        value={grade}
                        onValueChange={(value) => setGrade(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades?.map(({ grade: g }: any) => (
                            <SelectItem key={g} value={String(g)}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter assignment description"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type *</Label>
                    <Select
                      value={contentType}
                      onValueChange={(value: "video" | "text" | "pdf") =>
                        setContentType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="video">Video Upload</SelectItem>
                        <SelectItem value="pdf">PDF Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {contentType === "video" && (
                    <div className="space-y-2">
                      <Label htmlFor="video-upload">Video File</Label>
                      {assignment?.videoUrl && (
                        <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            📹 Current video:
                            {assignment.videoUrl.split("/").pop()}
                          </p>
                        </div>
                      )}
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setVideoFile(file);
                        }}
                      />
                      <p className="text-sm text-gray-500">
                        Leave empty to keep existing video (Max
                        {MAX_FILE_SIZE_MB}MB)
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
                        placeholder="Enter text content"
                        rows={8}
                        required
                      />
                    </div>
                  )}
                  {contentType === "pdf" && (
                    <div className="space-y-2">
                      <Label htmlFor="pdf-upload">PDF File</Label>
                      {assignment?.pdfUrl && (
                        <div className="mb-2 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            📄 Current PDF: {assignment.pdfUrl.split("/").pop()}
                          </p>
                        </div>
                      )}
                      <Input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPdfFile(file);
                        }}
                      />
                      <p className="text-sm text-gray-500">
                        Leave empty to keep existing PDF (Max {MAX_FILE_SIZE_MB}
                        MB)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700"
                        >
                          Quiz Questions
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        Assessment Questions
                      </CardTitle>
                      <p className="text-slate-600 text-sm">
                        Update questions to test student understanding
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQuestion}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="excel-upload"
                      className="text-sm font-medium text-slate-700 flex items-center"
                    >
                      <FileUp className="w-4 h-4 mr-2" /> Import Questions from
                      Excel
                    </Label>
                    <Input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      className="cursor-pointer border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {questions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4 bg-slate-50/30"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800 flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm mr-2">
                            {questionIndex + 1}
                          </span>
                          Question {questionIndex + 1}
                        </h4>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Question
                        </Label>
                        <Input
                          placeholder="Enter your question..."
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "questionText",
                              e.target.value
                            )
                          }
                          className="h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Answer Options
                        </Label>
                        <RadioGroup
                          value={question.correctAnswer}
                          onValueChange={(value: string) =>
                            updateQuestion(question.id, "correctAnswer", value)
                          }
                        >
                          {question.options.map((option) => (
                            <div
                              key={option.label}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                option.label === question.correctAnswer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <RadioGroupItem
                                value={option.label}
                                id={`${question.id}-${option.label}`}
                                className="text-blue-600"
                              />
                              <Input
                                placeholder={`Option ${option.label}`}
                                value={option.text}
                                onChange={(e) =>
                                  updateOption(
                                    question.id,
                                    option.label,
                                    e.target.value
                                  )
                                }
                                className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0"
                                required
                              />
                              {option.label === question.correctAnswer && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700 text-xs"
                                >
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Updating..." : "Update Assignment"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
