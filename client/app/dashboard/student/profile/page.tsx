"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, MapPin, AlertCircle, BookOpen, Loader2, TrendingUp, Trophy } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

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
  const {user}=useAuth()
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
        const response = await api.get(`/student/${user?.id}`)
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
        const { data } = await api.get(`/student/${user?.id}/progress`)
        setProgress(data.data)
        setProgressError(null)
      } catch (err) {
        toast.error("Failed to fetch progress")
        setProgressError("Unable to load student progress.")
      } finally {
        setIsLoadingProgress(false)
      }
    }

    if (user?.id) {
      fetchStudentData()
      fetchProgress()
    }
  }, [user?.id])

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
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.profilePictureUrl || "/placeholder.svg?height=80&width=80"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {student.rollNumber}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Class {student.class}
                </span>
                <Badge variant="secondary">{student.gender}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProgress ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                </div>
              ) : progressError || !progress ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{progressError || "No progress data available"}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progress?.completedCount}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                      <div className="text-xs text-gray-500">of {progress?.totalChapters}</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{progress?.averageScore}%</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium">{progress?.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress?.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {progress?.completedChapters?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Recent Completions
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {progress?.completedChapters.slice(0, 5).map((completion) => (
                          <div
                            key={completion?._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{completion?.chapter?.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(completion?.completedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getGradeEmoji(completion?.quizScore)}</span>
                              <Badge className={`text-xs ${getScoreColor(completion?.quizScore)}`}>
                                {completion?.quizScore}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={student.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={student.email} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" value={student.rollNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input id="class" value={student.class} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={student.gender} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" value={student.dateOfBirth} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentContact">Parent Contact</Label>
                  <Input id="parentContact" value={student.parentContact} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" value={student.address.street} readOnly />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={student.address.city} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={student.address.state} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={student.address.country} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" value={student.address.postalCode} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
