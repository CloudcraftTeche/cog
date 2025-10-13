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
  Sparkles,
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

export default function AdminUploadAssignment() {
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
            reject(
              new Error(
                `Cloudinary error ${xhr.status}: ${
                  xhr.responseText || "No response"
                }`
              )
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
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Upload Assignment</h1>
          </div>
          <p className="text-indigo-100 text-lg">Create engaging assignments and assessments for your students</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
        {success && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              Assignment uploaded successfully! Students can now access this material.
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
            <TabsList className="grid w-full max-w-md grid-cols-3 h-14 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-2">
              <TabsTrigger
                value="video"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Video className="w-5 h-5" /> <span className="font-medium">Video</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" /> <span className="font-medium">Text</span>
              </TabsTrigger>
              <TabsTrigger
                value="pdf"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <FileText className="w-5 h-5" /> <span className="font-medium">PDF</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-4 py-1 rounded-full"
                  >
                    Basic Info
                  </Badge>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Assignment Details
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Basic information about your educational assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="flex md:flex-row flex-col flex-wrap gap-6 md:items-center justify-between">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                      Assignment Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="grade" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2"></div>
                      Grade Level
                    </Label>
                    <Select
                      onValueChange={(val) => setGrade(val)}
                      value={grade}
                      required
                    >
                      <SelectTrigger
                        id="grade"
                        className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {grades?.map(({ grade: g }) => (
                          <SelectItem key={g} value={String(g)} className="rounded-lg">
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2"></div>
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-2"></div>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn from this assignment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 rounded-xl resize-none transition-all duration-300"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <TabsContent value="video" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="pb-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 px-4 py-1 rounded-full"
                    >
                      Video
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Video Upload
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Upload your video assignment file (Max {MAX_FILE_SIZE_MB}MB)
                    <br />
                    <span className="text-xs text-blue-600">
                      Large files will be automatically compressed for faster upload
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-3">
                    <Label htmlFor="video-upload" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                      Upload Video
                    </Label>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setVideoFile(file);
                      }}
                      className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl cursor-pointer transition-all duration-300"
                      required={contentType === "video"}
                      disabled={uploading || isCompressing}
                    />
                    {videoFile && (
                      <div className="space-y-2 p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm text-slate-600">
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
              <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardHeader className="pb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 px-4 py-1 rounded-full"
                    >
                      Text
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Text Content
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Add text content for the assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter or paste the assignment text here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={12}
                        className="border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl resize-none font-serif text-sm leading-relaxed min-h-[400px] transition-all duration-300"
                        required={contentType === "text"}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{textContent.length} characters</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-600 font-medium">Ready for students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <CardHeader className="pb-4 bg-gradient-to-br from-red-50 to-orange-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-0 px-4 py-1 rounded-full"
                    >
                      PDF
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    PDF Upload
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Upload your PDF document for the assignment (Max {MAX_FILE_SIZE_MB}MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-3">
                    <Label htmlFor="pdf-upload" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-2"></div>
                      Upload PDF
                    </Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPdfFile(file);
                      }}
                      className="h-12 border-2 border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-xl cursor-pointer transition-all duration-300"
                      required={contentType === "pdf"}
                      disabled={uploading || isCompressing}
                    />
                    {pdfFile && (
                      <div className="space-y-2 p-4 bg-red-50 rounded-xl">
                        <p className="text-sm text-slate-600">
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

            <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="pb-4 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-0 px-4 py-1 rounded-full"
                      >
                        Quiz
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Assessment Questions
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-base">
                      Create questions to test student understanding for this assignment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid gap-2 mb-4">
                  <Label
                    htmlFor="excel-upload"
                    className="text-sm font-semibold text-slate-700 flex items-center"
                  >
                    <FileUp className="w-5 h-5 mr-2" /> Import Questions from Excel
                  </Label>
                  <Input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="cursor-pointer h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-300"
                  />
                </div>
                {questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="border-2 border-slate-200 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-3 shadow-md">
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700">Question</Label>
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
                        className="h-11 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700">Answer Options</Label>
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
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                              optionIndex === question.correctAnswer
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
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
                                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs border-0 px-3 py-1 rounded-full"
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
                <div className="w-full flex sm:justify-end justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-transparent rounded-lg px-6 py-3 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(uploading || isCompressing) && (
              <Card className="my-8 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-2xl">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-800">
                        {isCompressing
                          ? "Compressing file..."
                          : "Uploading file..."}
                      </span>
                      <span className="text-sm text-blue-600 font-medium">
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
                className="px-6 sm:px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl w-full sm:w-auto transition-all duration-300"
              >
                <Link href="/dashboard/admin/assignments">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading || isCompressing}
                className="px-8 sm:px-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading || uploading || isCompressing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    {isCompressing
                      ? "Compressing..."
                      : uploading
                      ? "Uploading..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
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