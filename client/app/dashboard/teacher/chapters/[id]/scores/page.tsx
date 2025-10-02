"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface StudentScore {
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  completedAt: string | null;
  quizScore: number;
}

interface NotCompletedStudent {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
}

interface ChapterData {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  class: string;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalCompletedStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

interface ScoreData {
  chapter: ChapterData;
  completedStudents: StudentScore[];
  notCompletedStudents: NotCompletedStudent[];
  statistics: Statistics;
}

export default function ChapterScoresPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params?.id as string;
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/chapter/${chapterId}/completed-students`
      );
      if (response.data.success) {
        setScoreData(response.data.data);
      } else {
        toast.error("Failed to fetch score data");
      }
    } catch (error: any) {
      toast.error("Something went wrong while fetching scores");
      toast.error("Score fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchScoreData();
    }
  }, [chapterId]);

  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return "text-gray-600 bg-gray-100";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getGradeEmoji = (score: number, maxScore: number) => {
    if (maxScore === 0) return "📚";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📚";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">
              Unable to load chapter score data
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStudents =
    scoreData.completedStudents.length + scoreData.notCompletedStudents.length;
  const completionRate =
    totalStudents > 0
      ? Math.round((scoreData.completedStudents.length / totalStudents) * 100)
      : 0;

  const handleSendChapterReminder = async (studentId: string) => {
    try {
      await api.post(`/chapter/${chapterId}/remind/${studentId}`);
      toast.success(" Reminder sent successfully");
    } catch (error) {
      
      toast.error("Failed to send Reminder");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">
                    {scoreData.statistics.averageScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold">
                    {scoreData.statistics.passRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Completed ({scoreData.completedStudents.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({scoreData.notCompletedStudents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Student Performance
                  <Badge variant="secondary" className="ml-2">
                    {scoreData.completedStudents.length} completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scoreData.completedStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Completions Yet
                    </h3>
                    <p>No students have completed this chapter yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {scoreData.completedStudents.map((student, index) => (
                      <div
                        key={student.studentId}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-gray-50 transition-colors ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`text-2xl font-bold w-8 text-center ${
                                index === 0
                                  ? "text-yellow-600"
                                  : index === 1
                                  ? "text-gray-500"
                                  : index === 2
                                  ? "text-orange-600"
                                  : "text-gray-400"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  student.profilePictureUrl ||
                                  "/placeholder.svg?height=48&width=48"
                                }
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                {student.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {student.name}
                              </h3>
                              {index === 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Top Score
                                </Badge>
                              )}
                              {index === 1 && (
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                  2nd Place
                                </Badge>
                              )}
                              {index === 2 && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                  3rd Place
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {student.rollNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(student.completedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-2xl">
                              {getGradeEmoji(
                                student.quizScore,
                                scoreData.chapter.questionsCount
                              )}
                            </span>
                            <Badge
                              className={`text-lg font-bold px-3 py-1 ${getScoreColor(
                                student.quizScore,
                                scoreData.chapter.questionsCount
                              )}`}
                            >
                              {student.quizScore}
                            </Badge>
                          </div>
                          {student.quizScore ===
                            scoreData.statistics.highestScore &&
                            scoreData.statistics.highestScore > 0 && (
                              <div className="text-xs text-yellow-600 font-medium">
                                🎯 Perfect Score!
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Students
                  <Badge variant="outline" className="ml-2">
                    {scoreData.notCompletedStudents.length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scoreData.notCompletedStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      All Students Completed!
                    </h3>
                    <p>
                      Every student in the class has completed this chapter.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {scoreData.notCompletedStudents.map((student) => (
                      <Card
                        key={student._id}
                        className="shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 border-2 border-gray-200">
                                <AvatarImage
                                  src={
                                    student.profilePictureUrl ||
                                    "/placeholder.svg?height=48&width=48&query=default-avatar"
                                  }
                                  alt={`Avatar of ${student.name}`}
                                />
                                <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-600 text-white font-medium">
                                  {student.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {student.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-1"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-500" />
                                  {student.rollNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-gray-500" />
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <Badge
                              variant="outline"
                              className="text-gray-600 bg-gray-100 border-gray-200 text-xs px-2 py-1"
                            >
                              Not Started
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-700 border-gray-300 hover:bg-gray-100 bg-transparent"
                              onClick={() => {
                                handleSendChapterReminder(student?._id);
                              }}
                            >
                              Remind
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
