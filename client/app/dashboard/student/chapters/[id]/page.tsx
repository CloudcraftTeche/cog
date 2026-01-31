"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  useChapter,
  useStartChapter,
  useChaptersList,
} from "@/hooks/student/useChapters";
import { ErrorDisplay } from "@/components/shared/LoadingSpinner";
import { ChapterHeader } from "@/components/student/chapter/ChapterHeader";
import { ChapterContent } from "@/components/student/chapter/ChapterContent";
import { ChapterSubmission } from "@/components/student/chapter/ChapterSubmission";
import {
  findNextChapter,
  calculateQuizScore,
} from "@/utils/student/chapterUtils";
import { LoadingState } from "@/components/shared/LoadingComponent";
export default function ChapterDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const { data: chapter, isLoading, isError, error } = useChapter(id);
  const { data: allChaptersData } = useChaptersList({
    page: 1,
    limit: 100,
  });
  const startChapterMutation = useStartChapter();
  const nextChapter = useMemo(() => {
    if (!chapter || !allChaptersData?.chapters) return null;
    return findNextChapter(chapter, allChaptersData.chapters);
  }, [chapter, allChaptersData]);
  useEffect(() => {
    if (!chapter) return;
    if (chapter.isCompleted || chapter.status === "completed") {
      setSubmitted(true);
      setQuizScore(chapter.score ?? 0);
    }
    if (chapter.isAccessible && !chapter.isInProgress && !chapter.isCompleted) {
      startChapterMutation.mutate(chapter._id);
    }
  }, [chapter]);
  const handleAnswer = (qIndex: number, value: string) => {
    if (!submitted) {
      setSelectedAnswers((prev) => ({ ...prev, [qIndex]: value }));
    }
  };
  const handleSubmitSuccess = (result: { score: number }) => {
    const finalScore =
      result.score ||
      (chapter ? calculateQuizScore(chapter.questions, selectedAnswers) : 0);
    setQuizScore(finalScore);
    setSubmitted(true);
  };
  const handleNextChapter = () => {
    if (nextChapter) {
      router.push(`/dashboard/student/chapters/${nextChapter._id}`);
    } else {
      router.push(`/dashboard/student/chapters`);
      toast.info("You've completed all chapters in this unit!");
    }
  };
  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setQuizScore(0);
  };
  const currentScore = submitted
    ? quizScore > 0
      ? quizScore
      : chapter
        ? calculateQuizScore(chapter.questions, selectedAnswers)
        : 0
    : 0;
  if (isLoading) {
    return <LoadingState text=" chapter content..." />;
  }
  if (isError) {
    let errorMessage = "Unable to load chapter. Please try again later.";
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 403) {
        errorMessage =
          "You must complete previous chapters to access this chapter.";
      } else if (axiosError.response?.status === 404) {
        errorMessage = "Chapter not found.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else {
        errorMessage = error.message;
      }
    }
    return (
      <ErrorDisplay error={errorMessage} onRetry={() => router.refresh()} />
    );
  }
  if (!chapter) {
    return (
      <ErrorDisplay
        error="Chapter not found."
        onRetry={() => {
          router.refresh();
        }}
      />
    );
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
            <ChapterSubmission
              chapter={chapter}
              selectedAnswers={selectedAnswers}
              submitted={submitted}
              currentScore={currentScore}
              hasNextChapter={!!nextChapter}
              onAnswerChange={handleAnswer}
              onSubmitSuccess={handleSubmitSuccess}
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
