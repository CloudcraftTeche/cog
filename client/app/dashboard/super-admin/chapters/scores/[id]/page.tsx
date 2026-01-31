"use client";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChapterScores, useSendReminder } from "@/hooks/admin/useChapter";
import { calculateStatistics } from "@/utils/admin/chapter.utils";
import ExportButtons from "@/components/admin/chapters/ExportButtons";
import StatisticsCards from "@/components/admin/chapters/StatisticsCards";
import CompletedStudentsTab from "@/components/admin/chapters/CompletedStudentsTab";
import PendingStudentsTab from "@/components/admin/chapters/PendingStudentsTab";
import { LoadingState } from "@/components/shared/LoadingComponent";
import {
  ChapterHeader,
  ErrorDisplay,
} from "@/components/admin/chapters/SharedComponents";
export default function SuperAdminChapterScoresPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params?.id as string;
  const { data: scoreData, isLoading, error } = useChapterScores(chapterId);
  const sendReminderMutation = useSendReminder(chapterId);
  const handleSendChapterReminder = (studentId: string) => {
    sendReminderMutation.mutate(studentId);
  };
  if (isLoading) {
    return <LoadingState text="score data" />;
  }
  if (error || !scoreData) {
    return (
      <ErrorDisplay
        title="Failed to Load Scores"
        message="Unable to load chapter score data"
        onRetry={() => router.back()}
      />
    );
  }
  const { totalStudents, completionRate, passRate } = calculateStatistics(
    scoreData.completedStudents.length,
    scoreData.pendingStudents.length,
    scoreData.completedStudents,
    scoreData.chapter.questionsCount,
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-white/50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Chapters
        </Button>
        <ChapterHeader
          title={scoreData.chapter.title}
          description={scoreData.chapter.description}
          gradeNumber={scoreData.chapter.gradeId.grade}
          chapterNumber={scoreData.chapter.chapterNumber}
          questionsCount={scoreData.chapter.questionsCount}
          contentItems={scoreData.chapter.contentItems}
          submissionsCount={scoreData.completedStudents.length}
        />
        <ExportButtons
          chapterTitle={scoreData.chapter.title}
          questionsCount={scoreData.chapter.questionsCount}
          completedStudents={scoreData.completedStudents}
          notCompletedStudents={scoreData.pendingStudents}
          statistics={{
            totalCompletedStudents: scoreData.statistics.totalCompleted,
            averageScore: scoreData.statistics.averageScore,
            highestScore: scoreData.statistics.highestScore,
            lowestScore: scoreData.statistics.lowestScore,
            passRate,
          }}
        />
        <StatisticsCards
          totalStudents={totalStudents}
          completionRate={completionRate}
          averageScore={scoreData.statistics.averageScore}
          passRate={passRate}
        />
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white rounded-2xl shadow-lg border-0 p-2">
            <TabsTrigger
              value="completed"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold transition-all duration-300"
            >
              <Trophy className="h-5 w-5" />
              Completed ({scoreData.completedStudents.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold transition-all duration-300"
            >
              <Clock className="h-5 w-5" />
              Pending ({scoreData.pendingStudents.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="completed" className="mt-6">
            <CompletedStudentsTab
              students={scoreData.completedStudents}
              questionsCount={scoreData.chapter.questionsCount}
              highestScore={scoreData.statistics.highestScore}
            />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <PendingStudentsTab
              students={scoreData.pendingStudents}
              onSendReminder={handleSendChapterReminder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
