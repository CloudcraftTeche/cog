"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, MapPin, AlertCircle, BookOpen, Loader2, TrendingUp, Trophy } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface Student {
  name: string
  email: string
  rollNumber: string
  class: string
  gender: string
  dateOfBirth: string
  parentContact: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  profilePictureUrl: string
}

interface CompletedChapter {
  _id: string
  chapter: {
    _id: string
    title: string
  }
  quizScore: number
  completedAt: string
}

interface StudentProgress {
  totalChapters: number
  completedCount: number
  completionPercentage: number
  averageScore: number
  completedChapters: CompletedChapter[]
}

export default function StudentDetailsPage() {
  const params = useParams()
  const studentId = params.id as string
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [student, setStudent] = useState<Student>({
    name: "",
    email: "",
    rollNumber: "",
    class: "",
    gender: "",
    dateOfBirth: "",
    parentContact: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  })
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [progressError, setProgressError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoadingData(true)
        const response = await api.get(`/student/${studentId}`)
        const studentData = response.data.data
        setStudent({
          name: studentData.name || "",
          email: studentData.email || "",
          rollNumber: studentData.rollNumber || "",
          class: studentData.class || "",
          gender: studentData.gender || "",
          dateOfBirth: studentData.dateOfBirth ? studentData.dateOfBirth.split("T")[0] : "",
          parentContact: studentData.parentContact || "",
          address: {
            street: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            country: studentData.address?.country || "India",
            postalCode: studentData.address?.postalCode || "",
          },
          profilePictureUrl: studentData.profilePictureUrl || "",
        })
      } catch (error) {
        toast.error("Failed to fetch student data")
      } finally {
        setIsLoadingData(false)
      }
    }

    const fetchProgress = async () => {
      try {
        setIsLoadingProgress(true)
        const { data } = await api.get(`/student/${studentId}/progress`)
        setProgress(data.data)
        setProgressError(null)
      } catch (err) {
        toast.error("Failed to fetch progress")
        setProgressError("Unable to load student progress.")
      } finally {
        setIsLoadingProgress(false)
      }
    }

    if (studentId) {
      Promise.all([fetchStudentData(), fetchProgress()])
    }
  }, [studentId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100"
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getGradeEmoji = (score: number) => {
    if (score >= 90) return "🏆"
    if (score >= 80) return "🥇"
    if (score >= 70) return "🥈"
    if (score >= 60) return "🥉"
    return "📚"
  }

  if (isLoadingData) return null

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-3xl">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-2xl">
              <AvatarImage
                src={
                  student.profilePictureUrl ||
                  "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg?height=80&width=80" ||
                  "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg" ||
                  "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                }
              />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {student.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <span className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl shadow-md">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  {student.rollNumber}
                </span>
                <span className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl shadow-md">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  Class {student.class}
                </span>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md px-3 py-1">
                  {student.gender}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-blue-700">
                <TrendingUp className="h-6 w-6 mr-3 text-blue-500" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProgress ? (
                <div className="flex items-center justify-center py-8">
                  <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto" />
                  </div>
                </div>
              ) : progressError || !progress ? (
                <div className="text-center py-8">
                  <div className="bg-white/70 rounded-2xl p-6 shadow-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{progressError || "No progress data available"}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg border border-blue-200">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {progress.completedCount}
                      </div>
                      <div className="text-xs text-blue-700 font-medium">Completed</div>
                      <div className="text-xs text-blue-600">of {progress.totalChapters}</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-lg border border-emerald-200">
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {progress.averageScore}%
                      </div>
                      <div className="text-xs text-emerald-700 font-medium">Avg Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 font-medium">Overall Progress</span>
                      <span className="font-bold text-blue-600">{progress.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-white/70 rounded-full h-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${progress.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {progress.completedChapters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-blue-700 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Recent Completions
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {progress.completedChapters.slice(0, 5).map((completion, index) => {
                          const completionGradients = [
                            "from-rose-50 to-pink-50 border-rose-200",
                            "from-amber-50 to-orange-50 border-amber-200",
                            "from-emerald-50 to-teal-50 border-emerald-200",
                            "from-blue-50 to-indigo-50 border-blue-200",
                            "from-purple-50 to-violet-50 border-purple-200",
                          ]
                          const completionGradient = completionGradients[index % completionGradients.length]

                          return (
                            <div
                              key={completion._id}
                              className={`flex items-center justify-between p-4 bg-gradient-to-r ${completionGradient} rounded-2xl shadow-md border`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{completion.chapter.title}</p>
                                <p className="text-xs text-gray-600 font-medium">
                                  {formatDate(completion.completedAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getGradeEmoji(completion.quizScore)}</span>
                                <Badge className={`text-xs font-bold shadow-md ${getScoreColor(completion.quizScore)}`}>
                                  {completion.quizScore}%
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-green-700">
                <GraduationCap className="h-6 w-6 mr-3 text-green-500" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-green-700 font-medium">
                    Full Name
                  </Label>
                  <Input id="name" value={student.name} readOnly className="bg-white/70 border-green-200 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-700 font-medium">
                    Email Address
                  </Label>
                  <Input id="email" value={student.email} readOnly className="bg-white/70 border-green-200 shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-green-700 font-medium">
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    value={student.rollNumber}
                    readOnly
                    className="bg-white/70 border-green-200 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-green-700 font-medium">
                    Class
                  </Label>
                  <Input id="class" value={student.class} readOnly className="bg-white/70 border-green-200 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-green-700 font-medium">
                    Gender
                  </Label>
                  <Input
                    id="gender"
                    value={student.gender}
                    readOnly
                    className="bg-white/70 border-green-200 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-green-700 font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={student.dateOfBirth}
                    readOnly
                    className="bg-white/70 border-green-200 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentContact" className="text-green-700 font-medium">
                    Parent Contact
                  </Label>
                  <Input
                    id="parentContact"
                    value={student.parentContact}
                    readOnly
                    className="bg-white/70 border-green-200 shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-orange-700">
                <MapPin className="h-6 w-6 mr-3 text-orange-500" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-orange-700 font-medium">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={student.address.street}
                  readOnly
                  className="bg-white/70 border-orange-200 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-orange-700 font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={student.address.city}
                    readOnly
                    className="bg-white/70 border-orange-200 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-orange-700 font-medium">
                    State
                  </Label>
                  <Input
                    id="state"
                    value={student.address.state}
                    readOnly
                    className="bg-white/70 border-orange-200 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-orange-700 font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={student.address.country}
                    readOnly
                    className="bg-white/70 border-orange-200 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-orange-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={student.address.postalCode}
                    readOnly
                    className="bg-white/70 border-orange-200 shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
