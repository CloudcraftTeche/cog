"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { chapterService, TeacherChapter } from "@/utils/teacherChapter.service";
import ErrorState from "@/components/teacher/mychapter/ErrorState";
import LoadingState from "@/components/teacher/mychapter/LoadingState";
import ChapterHeader from "@/components/teacher/mychapter/ChapterHeader";
import ChapterContent from "@/components/teacher/mychapter/ChapterContent";
import QuizSection from "@/components/teacher/mychapter/QuizSection";

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
          "Unable to complete chapter. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextChapter = async () => {
    router.push(`/dashboard/student/chapters`);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 max-w-4xl">
        <ChapterHeader chapter={chapter} />

        <div className="space-y-6 sm:space-y-8">
          <ChapterContent chapter={chapter} />

          {chapter.questions && chapter.questions.length > 0 && (
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
