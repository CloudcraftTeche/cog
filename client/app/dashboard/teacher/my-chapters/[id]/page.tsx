"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Target,
  ArrowLeft,
  Play,
  FileText,
  Award,
} from "lucide-react";

interface Option {
  label: "A" | "B" | "C" | "D";
  text: string;
}

interface Question {
  questionText: string;
  options: Option[];
  correctAnswer: "A" | "B" | "C" | "D";
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  questions?: Question[];
  isCompleted: boolean;
  canAccess: boolean;
  chapterIndex: number;
  totalChapters: number;
  quizScore: number;
  isAccessible: boolean;
  isInProgress: boolean;
  createdAt: Date;
}

export default function TeacherChapterDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams() as { id: string };
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [completed, setCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  useEffect(() => {
    if (!user?.id || !id) return;

    const fetchChapter = async () => {
      try {
        const response = await api.get(
          `/teacher-chapter/${id}/teacher/${user.id}`
        );
        const chapterData = response.data?.data;
        if (chapterData) {
          setChapter(chapterData);
          setCompleted(chapterData.isCompleted || false);
          setQuizScore(chapterData.quizScore || 0);
          if (chapterData.isCompleted) setSubmitted(true);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError(
            "You must complete previous chapters to access this chapter."
          );
        } else if (err.response?.status === 404) {
          setError("Chapter not found.");
        } else {
          setError("Unable to load chapter. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [user?.id, id]);

  const handleAnswer = (qIndex: number, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const hasQuiz = !!(chapter?.questions && chapter.questions.length > 0);
  const allAnswered = hasQuiz
    ? (chapter?.questions ?? []).every(
        (_, i) => selectedAnswers[i] !== undefined
      )
    : false;

  const getCorrectAnswersCount = () => {
    return (
      chapter?.questions?.reduce((count, q, i) => {
        return selectedAnswers[i] === q.correctAnswer ? count + 1 : count;
      }, 0) || 0
    );
  };

  const calculateQuizScore = () => {
    if (!chapter?.questions?.length) return 0;
    const correctCount = getCorrectAnswersCount();
    return Math.round((correctCount / chapter.questions.length) * 100);
  };

  const refetchChapterData = async () => {
    if (!user?.id || !id) return;
    try {
      const response = await api.get(
        `/teacher-chapter/${id}/teacher/${user.id}`
      );
      const chapterData = response.data?.data;
      if (chapterData) {
        setChapter(chapterData);
        setCompleted(chapterData.isCompleted || false);
        setQuizScore(chapterData.quizScore || 0);
        if (chapterData.isCompleted) setSubmitted(true);
      }
    } catch (err) {
      console.error("Error refetching chapter data:", err);
    }
  };

  const submitQuiz = async () => {
    if (!chapter || !user?.id) return;
    setSubmittingCompletion(true);
    try {
      const score = calculateQuizScore();
      setQuizScore(score);

      await api.post(`/teacher-chapter/${user.id}/complete-chapter`, {
        chapterId: chapter._id,
        quizScore: score,
      });

      setSubmitted(true);
      setCompleted(true);
      setChapter((prev) => (prev ? { ...prev, isCompleted: true } : null));

      await refetchChapterData();
      router.push("/dashboard/teacher/my-chapters");
      toast.success("Quiz submitted successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to complete chapter. Please try again."
      );
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const markAsComplete = async () => {
    if (!chapter || !user?.id) return;
    setSubmittingCompletion(true);
    try {
      await api.post(`/teacher-chapter/${user.id}/complete-chapter`, {
        chapterId: chapter._id,
        quizScore: 0,
      });
      if (!hasQuiz) {
        router.push("/dashboard/teacher/my-chapters");
      } else {
        setCompleted(true);
        setChapter((prev) => (prev ? { ...prev, isCompleted: true } : null));
        await refetchChapterData();
        toast.success("Chapter marked as complete.");
      }
    } catch (err: any) {
      toast.error("Unable to complete chapter. Please try again.");
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const handleNextChapter = async () => {
    router.push("/dashboard/teacher/my-chapters");
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setQuizScore(0);
  };

  const currentScore = submitted
    ? quizScore > 0
      ? quizScore
      : calculateQuizScore()
    : 0;

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
              Loading chapter content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <p className="text-xl text-gray-700 font-medium mb-6">{error}</p>
            <Link href="/dashboard/teacher/chapters">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chapters
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-[400px] p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 text-center">
            <p className="text-xl text-gray-700 font-medium mb-6">
              Chapter not found.
            </p>
            <Link href="/dashboard/teacher/chapters">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chapters
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-float animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full animate-float"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ${
                  chapter.isCompleted
                    ? "from-green-400 to-emerald-500"
                    : "from-purple-400 to-pink-500"
                }`}
              >
                {chapter.isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {chapter.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {chapter.isCompleted && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Award className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300"
                  >
                    {chapter.contentType === "video" ? (
                      <Play className="h-3 w-3 mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {chapter.contentType}
                  </Badge>
                  {hasQuiz && (
                    <Badge
                      variant="outline"
                      className="text-purple-600 border-purple-300"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Quiz Included
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {chapter.totalChapters && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Chapter Progress</span>
              <span>
                {chapter.chapterIndex} of {chapter.totalChapters}
              </span>
            </div>
            <Progress
              value={(chapter.chapterIndex / chapter.totalChapters) * 100}
              className="h-2 bg-gray-200"
            />
          </div>
        )}

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <CardTitle className="text-xl md:text-2xl text-gray-800">
              {chapter.title}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {chapter.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {chapter.contentType === "video" && chapter.videoUrl && (
              <div className="aspect-video bg-gray-900">
                {chapter.videoUrl.includes("youtube.com") ||
                chapter.videoUrl.includes("youtu.be") ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${
                      chapter.videoUrl.includes("watch?v=")
                        ? chapter.videoUrl.split("watch?v=")[1].split("&")[0]
                        : chapter.videoUrl.split("/").pop()
                    }?rel=0&modestbranding=1&iv_load_policy=3`}
                    title="YouTube Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={chapter.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            )}
            {chapter.contentType === "text" && chapter.textContent && (
              <div className="p-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div
                    className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: chapter.textContent }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasQuiz ? (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Optional Quiz
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Test your understanding (optional but recommended)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {chapter.questions?.map((q, index) => (
                <div key={index} className="space-y-4">
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

              {!submitted ? (
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  disabled={!allAnswered || submittingCompletion}
                  onClick={submitQuiz}
                >
                  {submittingCompletion ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Submit Quiz
                </Button>
              ) : (
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex justify-center">
                    <div
                      className={`px-6 py-3 rounded-xl border-2 text-lg font-bold shadow-lg ${
                        currentScore >= 70
                          ? "bg-green-50 border-green-300 text-green-800 shadow-green-100"
                          : currentScore >= 50
                          ? "bg-yellow-50 border-yellow-300 text-yellow-800 shadow-yellow-100"
                          : "bg-red-50 border-red-300 text-red-800 shadow-red-100"
                      }`}
                    >
                      Score: {currentScore}%
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!completed && (
                      <Button
                        variant="outline"
                        onClick={handleRetake}
                        className="bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Retake Quiz
                      </Button>
                    )}
                    <Button
                      onClick={handleNextChapter}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      {completed ? "Continue Learning" : "Next Chapter"}{" "}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          !completed && (
            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                disabled={submittingCompletion}
                onClick={markAsComplete}
              >
                {submittingCompletion ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Mark as Complete
              </Button>
            </div>
          )
        )}

        {completed && !hasQuiz && (
          <div className="flex justify-center">
            <Button
              onClick={handleNextChapter}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Continue Learning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
