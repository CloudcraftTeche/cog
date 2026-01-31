"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";import ExportButtons from "@/components/admin/chapters/ExportButtons";
import StatisticsCards from "@/components/admin/chapters/StatisticsCards";
import CompletedStudentsTab from "@/components/admin/chapters/CompletedStudentsTab";
import PendingStudentsTab from "@/components/admin/chapters/PendingStudentsTab";
import { TeacherChapterService } from "@/components/teacher/chapter/chapterApiAndTypes";

interface StudentScore {
  studentId: string;
  name: string;
  email: string;
  gradeId: {
    _id: string;
    grade: string;
  };
  rollNumber: string;
  profilePictureUrl?: string;
  completedAt: string | null;
  score: number;
}

interface NotCompletedStudent {
  studentId: string;
  name: string;
  gradeId: {
    _id: string;
    grade: string;
  };
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  status?: string;
  startedAt?: string | null;
}

interface ChapterData {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  chapterNumber: number;
  gradeId: {
    _id: string;
    grade: string;
  };
  questionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Statistics {
  totalCompleted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

interface ScoreData {
  chapter: ChapterData;
  completedStudents: StudentScore[];
  pendingStudents: NotCompletedStudent[];
  statistics: Statistics;
}

export default function TeacherChapterScoresPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const chapterId = params?.id as string;

  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScoreData = useCallback(async () => {
    if (!chapterId || !user?.id) return;

    try {
      setLoading(true);

      const chapterData = await TeacherChapterService.getChapterById(chapterId);

      const teacherGrade = await TeacherChapterService.getTeacherGrade(user.id);
      if (chapterData.gradeId._id !== teacherGrade._id) {
        toast.error("Unauthorized", {
          description:
            "You can only view scores for chapters in your assigned grade",
        });
        router.push("/dashboard/teacher/chapters");
        return;
      }

      const completedResponse =
        await TeacherChapterService.getCompletedStudents(chapterId);
      const completedData = completedResponse;

      const pendingResponse =
        await TeacherChapterService.getPendingStudents(chapterId);
      const pendingData = pendingResponse;

      const completedStudents = (completedData.data || []).filter(
        (s: StudentScore) => s.gradeId._id === teacherGrade._id
      );
      const pendingStudents = (pendingData.data || []).filter(
        (s: NotCompletedStudent) => s.gradeId._id === teacherGrade._id
      );

      const statistics = {
        totalCompleted: completedStudents.length,
        averageScore: completedData.stats?.averageScore || 0,
        highestScore: completedData.stats?.highestScore || 0,
        lowestScore: completedData.stats?.lowestScore || 0,
      };

      const combinedData: any = {
        chapter: {
          _id: chapterData._id,
          title: chapterData.title,
          description: chapterData.description,
          contentType: chapterData?.contentType,
          chapterNumber: chapterData.chapterNumber,
          gradeId: chapterData.gradeId,
          questionsCount: chapterData.questions?.length || 0,
          createdAt: chapterData.createdAt,
          updatedAt: chapterData.updatedAt,
        },
        completedStudents,
        pendingStudents,
        statistics,
      };

      setScoreData(combinedData);
    } catch (error: any) {
      console.error("Score fetch error:", error);
      toast.error(
        error.message || "Something went wrong while fetching scores"
      );
      router.push("/dashboard/teacher/chapters");
    } finally {
      setLoading(false);
    }
  }, [chapterId, user?.id, router]);

  useEffect(() => {
    fetchScoreData();
  }, [fetchScoreData]);

  const handleSendChapterReminder = async (studentId: string) => {
    try {
      await TeacherChapterService.sendReminder(chapterId, studentId);
      toast.success("Reminder sent successfully");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        <Card className="w-full max-w-md mx-4 shadow-2xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">
              Unable to load chapter score data
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStudents =
    scoreData.completedStudents.length + scoreData.pendingStudents.length;
  const completionRate =
    totalStudents > 0
      ? Math.round((scoreData.completedStudents.length / totalStudents) * 100)
      : 0;

  const passingScore = scoreData.chapter.questionsCount * 0.6;
  const passedStudents = scoreData.completedStudents.filter(
    (s) => (s.score || 0) >= passingScore
  ).length;
  const passRate =
    scoreData.completedStudents.length > 0
      ? Math.round((passedStudents / scoreData.completedStudents.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">{scoreData.chapter.title}</h1>
          <p className="text-indigo-100 text-lg">
            {scoreData.chapter.description}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              {scoreData.chapter.contentType === "video"
                ? "📹 Video"
                : "📚 Text"}{" "}
              Content
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              📝 {scoreData.chapter.questionsCount} Questions
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              🎓 Grade {scoreData.chapter.gradeId.grade}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              📖 Chapter {scoreData.chapter.chapterNumber}
            </span>
          </div>
        </div>

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
