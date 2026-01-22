"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Chapter, chapterService } from "@/utils/studentChapter.service";
import LoadingState from "@/components/student/chapter/LoadingState";
import ErrorState from "@/components/student/chapter/ErrorState";
import ChapterHeader from "@/components/student/chapter/ChapterHeader";
import ChapterContent from "@/components/student/chapter/ChapterContent";
import QuizAndSubmission from "@/components/student/chapter/ChapterSubmission";
export default function ChapterDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams() as { id: string };
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const fetchNextChapter = async (currentChapter: Chapter) => {
    try {
      const params = {
        page: 1,
        limit: 100,
      };
      const response = await chapterService.getChapters(params);
      const allChapters = response.data || [];
      const sameUnitChapters = allChapters.filter(
        (ch: Chapter) => ch.unitId === currentChapter.unitId
      );
      sameUnitChapters.sort(
        (a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber
      );
      const currentIndex = sameUnitChapters.findIndex(
        (ch: Chapter) => ch._id === currentChapter._id
      );
      if (currentIndex !== -1 && currentIndex < sameUnitChapters.length - 1) {
        const next = sameUnitChapters[currentIndex + 1];
        if (next.isAccessible) {
          setNextChapter(next);
        }
      }
    } catch (err) {
      console.error("Failed to fetch next chapter:", err);
    }
  };
  useEffect(() => {
    if (!user?.id || !id) return;
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chapterService.getChapterById(id);
        const chapterData = response.data;
        if (chapterData) {
          setChapter(chapterData);
          setQuizScore(chapterData.score || 0);
          if (chapterData.isCompleted || chapterData.status === "completed") {
            setSubmitted(true);
            await fetchNextChapter(chapterData);
          }
          if (
            chapterData.isAccessible &&
            !chapterData.isInProgress &&
            !chapterData.isCompleted
          ) {
            try {
              await chapterService.startChapter(id);
            } catch (err) {
              console.error("Failed to mark chapter as in progress:", err);
            }
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
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [user?.id, id]);
  const handleAnswer = (qIndex: number, value: string) => {
    if (!submitted) {
      setSelectedAnswers((prev) => ({ ...prev, [qIndex]: value }));
    }
  };
  const calculateQuizScore = () => {
    if (!chapter?.questions?.length) return 0;
    const correctCount = chapter.questions.reduce((count, q, i) => {
      return selectedAnswers[i] === q.correctAnswer ? count + 1 : count;
    }, 0);
    return Math.round((correctCount / chapter.questions.length) * 100);
  };
  const handleSubmitSuccess = async (result: any) => {
    const finalScore = result.score || calculateQuizScore();
    setQuizScore(finalScore);
    setSubmitted(true);
    const updatedChapter = chapter
      ? {
          ...chapter,
          isCompleted: true,
          status: "completed" as const,
          score: finalScore,
        }
      : null;
    setChapter(updatedChapter);
    if (updatedChapter) {
      await fetchNextChapter(updatedChapter);
    }
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
            <QuizAndSubmission
              chapter={chapter}
              selectedAnswers={selectedAnswers}
              submitted={submitted}
              currentScore={currentScore}
              hasNextChapter={!!nextChapter}
              onAnswerChange={handleAnswer}
              onSubmitSuccess={handleSubmitSuccess}
              onRetake={handleRetake}
              onNextChapter={handleNextChapter}
              calculateQuizScore={calculateQuizScore}
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
