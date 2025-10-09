"use client";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Upload,
  Video,
  FileUp,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { AnimatedProgress } from "@/components/ui/animated-progress";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const compressFile = async (file: File, maxSizeMB = 50): Promise<File> => {
  return new Promise((resolve) => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const video = document.createElement("video");

    video.onloadedmetadata = () => {
      canvas.width = Math.min(video.videoWidth, 1280);
      canvas.height = Math.min(video.videoHeight, 720);

      video.currentTime = 0;
      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.7
        );
      };
    };

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export default function UploadAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get("/grades/all");
        const data = await response.data.data;
        setGrades(data);
      } catch (error) {
        toast.error("Failed to fetch grades", {
          description: "Could not load available grade levels.",
        });
      }
    };
    fetchGrades();
  }, []);

  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
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

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === idx ? value : opt)),
            }
          : q
      )
    );
  };

  const handleExcelUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
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

          for (let rowIndex = 1; rowIndex < json.length; rowIndex++) {
            const row = json[rowIndex];
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
                  rowIndex + 1
                } was skipped due to missing question text, options, or correct answer.`,
              });
              continue;
            }

            let correctAnswerIndex = labels.indexOf(correctAnswerLabel);
            if (
              correctAnswerIndex === -1 ||
              correctAnswerIndex >= fixedOptions.length
            ) {
              toast.warning("Adjusting Correct Answer", {
                description: `Row ${
                  rowIndex + 1
                }: Correct answer '${correctAnswerLabel}' is invalid or out of bounds for 4 options. Defaulting to Option A.`,
              });
              correctAnswerIndex = 0;
            }

            newQuestions.push({
              id: Date.now().toString() + rowIndex,
              question: questionText,
              options: fixedOptions,
              correctAnswer: correctAnswerIndex,
            });

            if (rowIndex % 10 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

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
    },
    []
  );

  const MAX_FILE_SIZE_MB = 200;

  const uploadToCloudinary = async (
    file: File | null
  ): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      let fileToUpload = file;
      if (file.size > 50 * 1024 * 1024) {
        setIsCompressing(true);
        toast.info("Compressing file", {
          description: "Large file detected. Optimizing for faster upload...",
        });

        if (file.type.startsWith("video/")) {
          fileToUpload = await compressFile(file);
        }
        setIsCompressing(false);
      }

      const sigRes = await api.get("/cloudinary-signature");
      const { cloudName, apiKey, timestamp, signature, folder } = sigRes.data;

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json);
            } catch (err) {
              reject(new Error("Invalid JSON response from Cloudinary"));
            }
          } else {
            new Error(
              `Cloudinary error ${xhr.status}: ${
                xhr.responseText || "No response"
              }`
            );
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
        );
        xhr.send(formData);
      });

      setUploadProgress(100);
      return data.secure_url || null;
    } catch (err: any) {
      console.error("Upload failed:", err);

      if (err?.response) {
        console.error("Cloudinary error response:", err.response);
      }

      toast.error("Upload Failed", {
        description: err.message || "Could not upload file to Cloudinary.",
      });

      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    let videoUrl: string | null = null;
    let pdfUrl: string | null = null;

    if (contentType === "video" && videoFile) {
      videoUrl = await uploadToCloudinary(videoFile);
      if (!videoUrl) {
        setLoading(false);
        return;
      }
    }

    if (contentType === "pdf" && pdfFile) {
      pdfUrl = await uploadToCloudinary(pdfFile);
      if (!pdfUrl) {
        setLoading(false);
        return;
      }
    }

    const labels = ["A", "B", "C", "D"];
    const formattedQuestions = questions
      .map((q) => {
        const trimmedOptions = q.options.filter((opt) => opt.trim() !== "");
        if (!q.question.trim() || trimmedOptions.length < 1) return null;
        return {
          questionText: q.question.trim(),
          options: trimmedOptions.map((text, i) => ({
            label: labels[i],
            text,
          })),
          correctAnswer: labels[q.correctAnswer],
        };
      })
      .filter(Boolean);

    const payload = {
      title,
      description,
      grade,
      contentType,
      textContent: contentType === "text" ? textContent : undefined,
      videoUrl,
      pdfUrl,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      questions: formattedQuestions,
    };

    if (formattedQuestions.length === 0) {
      toast.error("Validation Error", {
        description: "Please add at least one valid question.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/assignment", payload);
      if (res.status === 201) {
        setSuccess(true);
        toast.success("Assignment Uploaded!", {
          description: "Assignment & quiz uploaded successfully.",
        });
        router.push("/dashboard/admin/assignments");
      }
    } catch (err: any) {
      toast.error("Upload Failed", {
        description:
          err.response?.data?.message || "An error occurred during upload.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {success && (
          <Alert className="mb-8 border-green-200 bg-green-50/50 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Assignment uploaded successfully! Students can now access this
              material.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={contentType}
          onValueChange={(val: string) =>
            setContentType(val as "video" | "text" | "pdf")
          }
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-sm sm:max-w-lg grid-cols-3 h-10 sm:h-12">
              <TabsTrigger
                value="video"
                className="flex items-center space-x-2"
              >
                <Video className="w-4 h-4" /> <span>Video</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" /> <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" /> <span>PDF</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
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
                <CardDescription className="text-slate-600">
                  Basic information about your educational assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className=" flex md:flex-row flex-col flex-wrap  gap-4 md:items-center max-w-2xl">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-slate-700"
                    >
                      Assignment Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-10 sm:h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="grade"
                      className="text-sm font-medium text-slate-700"
                    >
                      Grade Level *
                    </Label>
                    <Select
                      onValueChange={(val) => setGrade(val)}
                      value={grade}
                      required
                    >
                      <SelectTrigger
                        id="grade"
                        className="h-10 sm:h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades?.map(({ grade: g }) => (
                          <SelectItem key={g} value={String(g)}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn from this assignment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>
            <TabsContent value="video" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Video Upload</CardTitle>
                  <CardDescription className="text-slate-600">
                    Upload your video assignment file (Max {MAX_FILE_SIZE_MB}MB)
                    <br />
                    <span className="text-xs text-blue-600">
                      Large files will be automatically compressed for faster
                      upload
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">Upload Video</Label>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setVideoFile(file);
                      }}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                      required={contentType === "video"}
                      disabled={uploading || isCompressing}
                    />
                    {videoFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">
                          Selected: {videoFile.name} (
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                        {videoFile.size / (1024 * 1024) > 50 && (
                          <p className="text-sm text-blue-600">
                            ℹ️ This file will be compressed for faster upload
                          </p>
                        )}
                        {videoFile.size / (1024 * 1024) >
                          MAX_FILE_SIZE_MB * 0.9 && (
                          <p className="text-sm text-amber-600">
                            ⚠️ File size is close to the {MAX_FILE_SIZE_MB}MB
                            limit
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="text" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Text
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Text Content</CardTitle>
                  <CardDescription className="text-slate-600">
                    Add text content for the assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter or paste the assignment text here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={10}
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none font-serif text-sm leading-relaxed min-h-[300px] sm:min-h-[400px]"
                        required={contentType === "text"}
                      />
                      <p className="text-xs text-slate-500">
                        {textContent.length} characters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pdf" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      PDF
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">PDF Upload</CardTitle>
                  <CardDescription className="text-slate-600">
                    Upload your PDF document for the assignment (Max
                    {MAX_FILE_SIZE_MB}MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="pdf-upload">Upload PDF</Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPdfFile(file);
                      }}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                      required={contentType === "pdf"}
                      disabled={uploading || isCompressing}
                    />
                    {pdfFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">
                          Selected: {pdfFile.name} (
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                        {pdfFile.size / (1024 * 1024) >
                          MAX_FILE_SIZE_MB * 0.9 && (
                          <p className="text-sm text-amber-600">
                            ⚠️ File size is close to the {MAX_FILE_SIZE_MB}MB
                            limit
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700"
                      >
                        Quiz
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      Assessment Questions
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Create questions to test student understanding for this
                      assignment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2 mb-4">
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
                    className="cursor-pointer h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
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
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(
                            question.id,
                            "question",
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
                        value={question.correctAnswer.toString()}
                        onValueChange={(value: string) =>
                          updateQuestion(
                            question.id,
                            "correctAnswer",
                            Number.parseInt(value)
                          )
                        }
                      >
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                              optionIndex === question.correctAnswer
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              id={`${question.id}-${optionIndex}`}
                              className="text-blue-600"
                            />
                            <Input
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  question.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0"
                              required
                            />
                            {optionIndex === question.correctAnswer && (
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
                <div className=" w-full flex sm:justify-end justify-center">
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
              </CardContent>
            </Card>
            {(uploading || isCompressing) && (
              <Card className="my-8 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        {isCompressing
                          ? "Compressing file..."
                          : "Uploading file..."}
                      </span>
                      <span className="text-sm text-blue-600">
                        {isCompressing ? "Please wait" : `${uploadProgress}%`}
                      </span>
                    </div>
                    <AnimatedProgress
                      value={isCompressing ? 0 : uploadProgress}
                      className="h-2"
                    />
                    <p className="text-xs text-blue-600">
                      {isCompressing
                        ? "Optimizing file size for faster upload..."
                        : "This may take a few minutes for large files."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                asChild
                className="px-4 sm:px-6 bg-transparent w-full sm:w-auto"
              >
                <Link href="/dashboard/admin/assignments">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading || isCompressing}
                className="px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {loading || uploading || isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isCompressing
                      ? "Compressing..."
                      : uploading
                      ? "Uploading..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Assignment & Quiz
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
