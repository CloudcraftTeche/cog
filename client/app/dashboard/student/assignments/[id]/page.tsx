/// <reference lib="dom" />

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Video,
  File,
  Upload,
  CheckCircle,
  ArrowLeft,
  Play,
  FileText,
  Check,
  BookOpen,
  AlertCircle,
  Target,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedProgress } from "@/components/ui/animated-progress";

interface Question {
  _id: string;
  questionText: string;
  options: Array<{
    label: string;
    text: string;
  }>;
  correctAnswer: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "pdf" | "text";
  pdfUrl?: string;
  videoUrl?: string;
  text?: string;
  textContent?: string;
  dueDate: string;
  questions: Question[];
}

interface IOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

interface IQuestion {
  questionText: string;
  options: IOption[];
  correctAnswer: "A" | "B" | "C" | "D";
}

interface Answer {
  question: IQuestion;
  answer: string;
}

interface SubmissionContent {
  textContent: string;
  videoUrl: string;
  pdfUrl: string;
  videoFile?: File | null;
  pdfFile?: File | null;
}

type SubmissionType = "video" | "text" | "pdf";
type CurrentStep = "content" | "questions" | "submit" | "completed";

declare global {
  interface Window {
    File: {
      new (
        fileBits: BlobPart[],
        fileName: string,
        options?: FilePropertyBag
      ): File;
    };
  }
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
              const compressedFile = new window.File([blob], file.name, {
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

export default function AssignmentDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submissionType, setSubmissionType] = useState<SubmissionType>("text");
  const [submissionContent, setSubmissionContent] = useState<SubmissionContent>(
    {
      textContent: "",
      videoUrl: "",
      pdfUrl: "",
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [currentStep, setCurrentStep] = useState<CurrentStep>("content");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setError(null);
      const response = await api.get(`/assignment/${assignmentId}`);
      const assignmentData = response.data?.data;
      setAssignment(assignmentData);
      console.log(assignmentData);

      if (assignmentData?.questions) {
        setAnswers(
          assignmentData.questions.map((q: Question) => ({
            question: q,
            answer: "",
          }))
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load assignment";
      setError(errorMessage);
      console.error("Error fetching assignment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex: number, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: value }));

    setAnswers((prev) => {
      const newAnswers = [...prev];
      if (newAnswers[qIndex]) {
        newAnswers[qIndex].answer = value;
      }
      return newAnswers;
    });
  };

  const checkQuestionsCompleted = () => {
    if (!assignment) return false;
    return assignment.questions.every((question: Question, index: number) => {
      const answer = selectedAnswers[index];
      return answer && answer.trim() !== "";
    });
  };

  useEffect(() => {
    setQuestionsCompleted(checkQuestionsCompleted());
  }, [selectedAnswers, assignment]);

  const handleContentComplete = () => {
    setCurrentStep("questions");
  };

  const handleQuestionsComplete = () => {
    if (checkQuestionsCompleted()) {
      setCurrentStep("submit");
    }
  };

  useEffect(() => {
    if (questionsCompleted && currentStep === "questions") {
      handleQuestionsComplete();
    }
  }, [questionsCompleted, currentStep]);

  const renderContent = () => {
    if (!assignment) return null;

    switch (assignment.contentType) {
      case "video":
        return (
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
            {assignment.videoUrl ? (
              <video controls className="w-full h-full rounded-xl">
                <source
                  src={assignment.videoUrl.replace(
                    "/upload/",
                    "/upload/q_auto,f_auto,w_1280/"
                  )}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="bg-white/20 rounded-full p-6 mb-4 inline-block">
                    <Play className="h-12 w-12" />
                  </div>
                  <p className="text-lg">
                    Video content will be available soon
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "pdf":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
            {assignment.pdfUrl ? (
              <div>
                <div className="bg-blue-100 rounded-full p-6 mb-4 inline-block">
                  <File className="h-12 w-12 text-blue-600" />
                </div>
                <p className="mb-4 text-lg font-medium text-gray-800">
                  PDF Document Ready
                </p>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <a
                    href={
                      assignment.pdfUrl.includes("/raw/")
                        ? assignment.pdfUrl
                        : assignment.pdfUrl.replace("/upload/", "/raw/upload/")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <File className="h-4 w-4 mr-2" />
                    Open PDF
                  </a>
                </Button>
              </div>
            ) : (
              <div>
                <div className="bg-gray-200 rounded-full p-6 mb-4 inline-block">
                  <File className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-gray-600 text-lg">
                  PDF content will be available soon
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: assignment.textContent || assignment.description,
              }}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col justify-center items-center h-[400px] p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 animate-pulse">
              <Loader2 className="animate-spin w-8 h-8 text-white" />
            </div>
            <p className="text-xl text-gray-700 font-medium text-center">
              Loading assignment content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col justify-center items-center h-[400px] p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-xl text-gray-700 font-medium mb-6">
              {error || "Assignment not found"}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
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

      const data = await uploadRes.json();
      setUploadProgress(100);

      return data.secure_url;
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload Failed", {
        description: "Could not upload file to Cloudinary.",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setIsCompressing(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;

    setSubmitting(true);
    try {
      const finalSubmissionContent = { ...submissionContent };

      if (submissionType === "video" && submissionContent.videoFile) {
        const videoUrl = await uploadToCloudinary(submissionContent.videoFile);
        if (videoUrl) {
          finalSubmissionContent.videoUrl = videoUrl;
        }
      }

      if (submissionType === "pdf" && submissionContent.pdfFile) {
        const pdfUrl = await uploadToCloudinary(submissionContent.pdfFile);
        if (pdfUrl) {
          finalSubmissionContent.pdfUrl = pdfUrl;
        }
      }
      console.log(answers);

      await api.post("/submission", {
        student: user?.id,
        assignment: assignment?._id,
        submissionType,
        answers: answers.map((q, index) => ({
          question: {
            questionText: q.question.questionText,
            options: q.question.options,
            correctAnswer: q.question.correctAnswer,
          },
          answer: selectedAnswers[index] || "",
        })),
        submitted: true,
        ...finalSubmissionContent,
      });

      setSubmitted(true);
      setCurrentStep("completed");
      toast.success("Assignment submitted successfully!");
    } catch (err) {
      console.error("Error submitting assignment:", err);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (file: File | null, type: "video" | "pdf") => {
    setSubmissionContent((prev) => ({
      ...prev,
      [`${type}File`]: file,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full animate-float"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 bg-white text-purple-600 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ${
                  submitted
                    ? "from-green-400 to-emerald-500"
                    : "from-purple-400 to-pink-500"
                }`}
              >
                {submitted ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {assignment.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {submitted && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Submitted
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300"
                  >
                    {assignment.contentType === "video" ? (
                      <Play className="h-3 w-3 mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {assignment.contentType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Assignment Progress</span>
            <span>
              {currentStep === "content"
                ? "1"
                : currentStep === "questions"
                ? "2"
                : currentStep === "submit"
                ? "3"
                : "4"}
              of 4 steps
            </span>
          </div>
          <Progress
            value={
              currentStep === "content"
                ? 25
                : currentStep === "questions"
                ? 50
                : currentStep === "submit"
                ? 75
                : 100
            }
            className="h-2 bg-gray-200"
          />
        </div>

        {currentStep === "content" && (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <CardTitle className="text-xl md:text-2xl text-gray-800">
                {assignment.title}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {assignment.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8">{renderContent()}</div>

              <div className="p-8 pt-0">
                <Button
                  onClick={handleContentComplete}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Mark Content as Completed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "questions" && (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Questions ({assignment.questions.length})
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Answer all questions to proceed to submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {assignment.questions.map((q: Question, index: number) => (
                <div key={q._id} className="space-y-4">
                  <p className="font-semibold text-lg text-gray-800">
                    Q{index + 1}: {q.questionText}
                  </p>
                  <RadioGroup
                    value={selectedAnswers[index] || ""}
                    onValueChange={(val) => handleAnswer(index, val)}
                    className="space-y-3"
                  >
                    {q.options.map((opt) => {
                      const isSelected = selectedAnswers[index] === opt.label;
                      const isCorrectOption = opt.label === q.correctAnswer;
                      const isSubmitted = submitted;

                      let optionClasses =
                        "flex items-center gap-3 border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md";

                      if (isSubmitted) {
                        if (isCorrectOption) {
                          optionClasses +=
                            " border-green-400 bg-green-50 shadow-green-100";
                        } else if (isSelected && !isCorrectOption) {
                          optionClasses +=
                            " border-red-400 bg-red-50 shadow-red-100";
                        } else {
                          optionClasses += " border-gray-200 bg-gray-50";
                        }
                      } else {
                        if (isSelected) {
                          optionClasses +=
                            " border-purple-400 bg-purple-50 shadow-purple-100";
                        } else {
                          optionClasses +=
                            " border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25";
                        }
                      }

                      const optionId = `question-${index}-option-${opt.label}`;

                      return (
                        <div key={opt.label} className={optionClasses}>
                          <RadioGroupItem
                            value={opt.label}
                            id={optionId}
                            disabled={submitted}
                            className="text-purple-600"
                          />
                          <label
                            htmlFor={optionId}
                            className="text-gray-700 font-medium w-full cursor-pointer"
                          >
                            <span className="font-bold text-purple-600 mr-2">
                              {opt.label}.
                            </span>
                            {opt.text}
                          </label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}

              <div className="flex justify-center">
                <Button
                  onClick={() => setCurrentStep("submit")}
                  disabled={!questionsCompleted}
                  className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Next Step
                </Button>
              </div>

              {questionsCompleted && (
                <div className="flex justify-center pt-6">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">All Questions Answered!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === "submit" && (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                Submit Assignment
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Choose your submission type and upload your work.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-800">
                  Submission Type
                </Label>
                <RadioGroup
                  value={submissionType}
                  onValueChange={(value: SubmissionType) =>
                    setSubmissionType(value)
                  }
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <RadioGroupItem
                      value="text"
                      id="text"
                      className="border-green-500"
                    />
                    <Label
                      htmlFor="text"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                      Text Content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <RadioGroupItem
                      value="video"
                      id="video"
                      className="border-blue-500"
                    />
                    <Label
                      htmlFor="video"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Video className="h-4 w-4 text-blue-600" />
                      Video Upload
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <RadioGroupItem
                      value="pdf"
                      id="pdf"
                      className="border-orange-500"
                    />
                    <Label
                      htmlFor="pdf"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <File className="h-4 w-4 text-orange-600" />
                      PDF Upload
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {submissionType === "text" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="textContent"
                    className="text-base font-medium text-gray-800"
                  >
                    Text Content
                  </Label>
                  <Textarea
                    id="textContent"
                    placeholder="Enter your submission content..."
                    value={submissionContent.textContent}
                    onChange={(e) =>
                      setSubmissionContent((prev) => ({
                        ...prev,
                        textContent: e.target.value,
                      }))
                    }
                    className="min-h-[200px] border-green-200 focus:border-green-400"
                  />
                </div>
              )}

              {submissionType === "video" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="videoFile"
                    className="text-base font-medium text-gray-800"
                  >
                    Upload Video
                  </Label>
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null, "video")
                    }
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              )}

              {submissionType === "pdf" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="pdfFile"
                    className="text-base font-medium text-gray-800"
                  >
                    Upload PDF
                  </Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null, "pdf")
                    }
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
              )}

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
              <Button
                onClick={handleSubmit}
                disabled={submitting || uploading || isCompressing}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "completed" && (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-green-700">
                  Assignment Submitted!
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                  Your assignment has been submitted successfully. Your teacher
                  will review it and provide feedback soon.
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assignments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
