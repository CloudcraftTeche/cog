"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, TrendingUp, Calendar, Mail, User, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface StudentScore {
  studentId: string
  name: string
  email: string
  rollNumber: string
  profilePictureUrl?: string
  completedAt: string | null
  quizScore: number
}

interface NotCompletedStudent {
  _id: string
  name: string
  email: string
  rollNumber: string
  profilePictureUrl?: string
}

interface ChapterData {
  _id: string
  title: string
  description: string
  contentType: string
  class: string
  questionsCount: number
  createdAt: string
  updatedAt: string
}

interface Statistics {
  totalCompletedStudents: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
}

interface ScoreData {
  chapter: ChapterData
  completedStudents: StudentScore[]
  notCompletedStudents: NotCompletedStudent[]
  statistics: Statistics
}

export default function ChapterScoresPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = params?.id as string
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchScoreData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/chapter/${chapterId}/completed-students`)

      if (response.data.success) {
        setScoreData(response.data.data)
      } else {
        toast.error("Failed to fetch score data")
      }
    } catch (error: any) {
      toast.error("Something went wrong while fetching scores")
      toast.error("Score fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (chapterId) {
      fetchScoreData()
    }
  }, [chapterId,fetchScoreData])

  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return "text-gray-600 bg-gray-100"
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getGradeEmoji = (score: number, maxScore: number) => {
    if (maxScore === 0) return "📚"
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "🏆"
    if (percentage >= 80) return "🥇"
    if (percentage >= 70) return "🥈"
    if (percentage >= 60) return "🥉"
    return "📚"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="">
        <div className="container mx-auto px-4 ">
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
    )
  }

  if (!scoreData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">Unable to load chapter score data</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalStudents = scoreData.completedStudents.length + scoreData.notCompletedStudents.length
  const completionRate = totalStudents > 0 ? Math.round((scoreData.completedStudents.length / totalStudents) * 100) : 0

  const handleSendChapterReminder = async (studentId: string) => {
    try {
      await api.post(`/chapter/${chapterId}/remind/${studentId}`)
      toast.success("Reminder sent successfully")
    } catch (error) {
      toast.error("Failed to send Reminder")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-green-100 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-yellow-100 font-medium">Average Score</p>
                  <p className="text-3xl font-bold">{scoreData.statistics.averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-purple-100 font-medium">Pass Rate</p>
                  <p className="text-3xl font-bold">{scoreData.statistics.passRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              Pending ({scoreData.notCompletedStudents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
                <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
                  <TrendingUp className="h-6 w-6" />
                  Student Performance
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 rounded-full">
                    {scoreData.completedStudents.length} completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scoreData.completedStudents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">No Completions Yet</h3>
                    <p className="text-lg">No students have completed this chapter yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {scoreData.completedStudents.map((student, index) => (
                      <div
                        key={student.studentId}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 hover:bg-gray-50 transition-colors ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-50 to-slate-50"
                              : index === 2
                                ? "bg-gradient-to-r from-orange-50 to-amber-50"
                                : ""
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`text-3xl font-bold w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                                index === 0
                                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                  : index === 1
                                    ? "bg-gradient-to-r from-gray-400 to-gray-600"
                                    : index === 2
                                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                                      : "bg-gradient-to-r from-blue-400 to-indigo-500"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                              <AvatarImage
                                src={
                                  student.profilePictureUrl ||
                                  "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg?height=64&width=64" ||
                                  "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                                }
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold">
                                {student.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center flex-wrap gap-3">
                              <h3 className="font-bold text-xl text-gray-900">{student.name}</h3>
                              {index === 0 && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 rounded-full font-semibold">
                                  <Trophy className="h-4 w-4 mr-1" />
                                  Top Score
                                </Badge>
                              )}
                              {index === 1 && (
                                <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 px-3 py-1 rounded-full font-semibold">
                                  2nd Place
                                </Badge>
                              )}
                              {index === 2 && (
                                <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 px-3 py-1 rounded-full font-semibold">
                                  3rd Place
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                <User className="h-4 w-4 text-blue-500" />
                                {student.rollNumber}
                              </span>
                              <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                <Mail className="h-4 w-4 text-green-500" />
                                {student.email}
                              </span>
                              <span className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                {formatDate(student.completedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-4xl">
                              {getGradeEmoji(student.quizScore, scoreData.chapter.questionsCount)}
                            </span>
                            <Badge
                              className={`text-2xl font-bold px-4 py-2 rounded-2xl shadow-lg ${getScoreColor(
                                student.quizScore,
                                scoreData.chapter.questionsCount,
                              )}`}
                            >
                              {student.quizScore}
                            </Badge>
                          </div>
                          {student.quizScore === scoreData.statistics.highestScore &&
                            scoreData.statistics.highestScore > 0 && (
                              <div className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold">
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
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8">
                <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
                  <Clock className="h-6 w-6" />
                  Pending Students
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 rounded-full">
                    {scoreData.notCompletedStudents.length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scoreData.notCompletedStudents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">All Students Completed!</h3>
                    <p className="text-lg">Every student in the class has completed this chapter.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {scoreData.notCompletedStudents.map((student) => (
                      <Card
                        key={student._id}
                        className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl m-4"
                      >
                        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16 border-4 border-orange-200 shadow-lg">
                                <AvatarImage
                                  src={
                                    student.profilePictureUrl ||
                                    "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg?height=64&width=64&query=default-avatar" ||
                                    "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                                  }
                                  alt={`Avatar of ${student.name}`}
                                />
                                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xl font-bold">
                                  {student.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center flex-wrap gap-3">
                                <h3 className="font-bold text-xl text-gray-900">{student.name}</h3>
                                <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200 px-3 py-1 rounded-full font-semibold">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Pending
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                  <User className="h-4 w-4 text-blue-500" />
                                  {student.rollNumber}
                                </span>
                                <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                  <Mail className="h-4 w-4 text-green-500" />
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-center">
                            <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 px-4 py-2 rounded-full font-semibold">
                              Not Started
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-400 text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 rounded-xl px-6 py-2 font-semibold transition-all duration-300"
                              onClick={() => {
                                handleSendChapterReminder(student?._id)
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
  )
}
