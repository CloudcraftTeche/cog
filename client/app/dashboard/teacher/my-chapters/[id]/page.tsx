"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";
import { chapterService, TeacherChapter } from "@/utils/teacherChapter.service";
import ErrorState from "@/components/teacher/mychapter/ErrorState";
import LoadingState from "@/components/teacher/mychapter/LoadingState";
import ChapterHeader from "@/components/teacher/mychapter/ChapterHeader";
import ChapterContent from "@/components/teacher/mychapter/ChapterContent";
import QuizSection from "@/components/teacher/mychapter/QuizSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
export default function ChapterDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams() as { id: string };
  const [chapter, setChapter] = useState<
    | (TeacherChapter & {
        chapterIndex?: number;
        totalChapters?: number;
        quizScore?: number;
      })
    | null
  >(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [loadingNextChapter, setLoadingNextChapter] = useState(false);
  useEffect(() => {
    if (!user?.id || !id) return;
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chapterService.getChapterById(id, user.id);
        const chapterData = response.data;
        if (chapterData) {
          setChapter(chapterData);
          setQuizScore(chapterData.quizScore || 0);
          if (chapterData.isCompleted) {
            setSubmitted(true);
          }
        }
      } catch (err: any) {
        let errorMessage = "Unable to load chapter. Please try again later.";
        if (err.response?.status === 403) {
          errorMessage =
            "You must complete previous chapters to access this chapter.";
        } else if (err.response?.status === 404) {
          errorMessage = "Chapter not found.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [user?.id, id]);
  const handleAnswer = (qIndex: number, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };
  const calculateQuizScore = () => {
    if (!chapter?.questions?.length) return 0;
    const correctCount = chapter.questions.reduce((count, q, i) => {
      return selectedAnswers[i] === q.correctAnswer ? count + 1 : count;
    }, 0);
    return Math.round((correctCount / chapter.questions.length) * 100);
  };
  const submitQuiz = async () => {
    if (!chapter || !user?.id) return;
    setSubmitting(true);
    try {
      const score = calculateQuizScore();
      setQuizScore(score);
      await chapterService.completeChapter(user?.id, chapter._id, score);
      setSubmitted(true);
      setChapter((prev) => (prev ? { ...prev, isCompleted: true } : null));
      toast.success("Quiz submitted successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to complete chapter. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const completeChapterWithoutQuiz = async () => {
    if (!chapter || !user?.id) return;
    setSubmitting(true);
    try {
      await chapterService.completeChapter(user?.id, chapter._id, 100);
      setChapter((prev) => (prev ? { ...prev, isCompleted: true } : null));
      toast.success("Chapter completed successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to complete chapter. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleNextChapter = async () => {
    if (!user?.id || !chapter) return;
    setLoadingNextChapter(true);
    try {
      const response = await chapterService.getChapters({
        unitId: chapter.unitId,
      });
      if (response.data && response.data.length > 0) {
        const sortedChapters = response.data.sort(
          (a, b) => a.chapterNumber - b.chapterNumber,
        );
        const currentIndex = sortedChapters.findIndex(
          (ch) => ch._id === chapter._id,
        );
        if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
          const nextChapter = sortedChapters[currentIndex + 1];
          router.push(`/dashboard/teacher/my-chapters/${nextChapter._id}`);
        } else {
          toast.info("You've completed all chapters in this unit!");
          router.push(`/dashboard/teacher/my-chapters`);
        }
      } else {
        router.push(`/dashboard/teacher/my-chapters`);
      }
    } catch (err) {
      toast.error("Unable to load next chapter. Please try again.");
      setLoadingNextChapter(false);
    }
  };
  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setQuizScore(0);
    setChapter((prev) => (prev ? { ...prev, isCompleted: false } : null));
  };
  const currentScore = submitted
    ? quizScore > 0
      ? quizScore
      : calculateQuizScore()
    : 0;
  if (loading) {
    return <LoadingState message="Loading chapter content..." />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!chapter) {
    return <ErrorState message="Chapter not found." />;
  }
  const hasQuestions = chapter.questions && chapter.questions.length > 0;
  return (
    <div className="min-h-screen bg-white">
      {loadingNextChapter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            <p className="text-lg font-semibold text-gray-800">
              Loading next chapter...
            </p>
          </div>
        </div>
      )}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full animate-float" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 max-w-4xl">
        <ChapterHeader chapter={chapter} />
        <div className="space-y-6 sm:space-y-8">
          <ChapterContent chapter={chapter} />
          {hasQuestions ? (
            <QuizSection
              chapter={chapter}
              selectedAnswers={selectedAnswers}
              submitted={submitted}
              submitting={submitting}
              currentScore={currentScore}
              onAnswerChange={handleAnswer}
              onSubmit={submitQuiz}
              onRetake={handleRetake}
              onNextChapter={handleNextChapter}
            />
          ) : (
            <div className="flex justify-center gap-4 pt-6">
              {!chapter.isCompleted ? (
                <Button
                  onClick={completeChapterWithoutQuiz}
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Chapter
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextChapter}
                  disabled={loadingNextChapter}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loadingNextChapter ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Next Chapter
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
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
