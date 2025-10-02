"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Video,
  FileText,
  MoreVertical,
  BarChart3,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Assignment {
  _id: string
  title: string
  description: string
  grade: number
  contentType: "video" | "text" | "pdf"
  videoUrl?: string
  pdfUrl?: string
  textContent?: string
  startDate: Date
  endDate: Date
  createdAt: Date
  submittedStudents: string[]
}

const ITEMS_PER_PAGE = 6

export default function TeacherAssignmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [grades, setGrades] = useState([])

  const [selectedGrade, setSelectedGrade] = useState("")

  const fetchassignments = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assignment`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          grade: selectedGrade,
        },
      })
      const { data = [], total = 0 } = response.data

      setAssignments(data)
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE))
    } catch (error) {
      toast.error("Something went wrong while fetching assignments.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        const response = await api.get("/grades/all")
        const data = response.data.data
        setGrades(data)
        await fetchassignments()
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [user?.id, currentPage, searchTerm, selectedGrade])

  const handleDeleteassignment = async (assignmentId: string) => {
    try {
      await api.delete(`/assignment/${assignmentId}`)
      toast.success("assignment deleted successfully.")
      fetchassignments()
    } catch (error) {
      toast.error("Failed to delete assignment. Try again.")
    }
  }

  const handleViewScores = (assignmentId: string) => {
    router.push(`/dashboard/teacher/assignments/${assignmentId}/submissions`)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date()
    const startDate = new Date(assignment.startDate)
    const endDate = new Date(assignment.endDate)

    if (now < startDate) return "locked"
    if (now > endDate) return "ended"
    return "active"
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
          color: "text-green-600",
          gradient: "from-green-400 to-emerald-500",
        }
      case "locked":
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Lock,
          color: "text-gray-600",
          gradient: "from-gray-400 to-slate-500",
        }
      case "ended":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
          color: "text-red-600",
          gradient: "from-red-400 to-rose-500",
        }
      default:
        return {
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          icon: Clock,
          color: "text-blue-600",
          gradient: "from-blue-400 to-indigo-500",
        }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Assignment Hub</h1>
                    <p className="text-purple-100 text-lg">Create, manage, and track student assignments</p>
                  </div>
                </div>
              </div>
              <Button
                className="bg-white text-purple-600 hover:bg-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold px-8 py-4"
                onClick={() => router.push("/dashboard/teacher/assignments/upload")}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Find Assignments</h3>
                </div>
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class" className="text-blue-900 font-semibold">
                  Filter by Grade
                </Label>
                <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)}>
                  <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades?.map(({ grade }) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-blue-50">
              <CardContent className="p-16 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No assignments found</h3>
                <p className="text-gray-600 mb-8 text-lg">Start creating engaging assignments for your students</p>
                <Button
                  onClick={() => router.push("/dashboard/teacher/assignments/upload")}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Assignment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {assignments.map((assignment, index) => {
                  const status = getAssignmentStatus(assignment)
                  const statusConfig = getStatusConfig(status)
                  const StatusIcon = statusConfig.icon

                  const cardGradients = [
                    "from-blue-400 to-blue-600",
                    "from-green-400 to-green-600",
                    "from-purple-400 to-purple-600",
                    "from-pink-400 to-pink-600",
                    "from-indigo-400 to-indigo-600",
                    "from-orange-400 to-orange-600",
                  ]
                  const cardGradient = cardGradients[index % cardGradients.length]

                  return (
                    <Card
                      key={assignment._id}
                      className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${cardGradient}`}></div>
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-r ${
                                assignment.contentType === "video"
                                  ? "from-red-400 to-pink-500"
                                  : "from-blue-400 to-indigo-500"
                              }`}
                            >
                              {assignment.contentType === "video" ? (
                                <Video className="h-8 w-8 text-white" />
                              ) : (
                                <FileText className="h-8 w-8 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 truncate">{assignment?.title}</h3>
                                <Badge
                                  className={`capitalize text-xs font-semibold ${
                                    assignment.contentType === "video"
                                      ? "bg-gradient-to-r from-red-400 to-pink-500 text-white border-0"
                                      : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0"
                                  }`}
                                >
                                  {assignment.contentType}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                {assignment?.description}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`bg-gradient-to-r ${statusConfig.gradient.replace("from-", "from-").replace("to-", "to-")}/10 rounded-xl p-4 border border-${statusConfig.gradient.split("-")[1]}-200`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                              <Badge className={`${statusConfig.badge} font-semibold`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              {status === "active" && (
                                <span className="text-green-700">🎯 Assignment is live for students</span>
                              )}
                              {status === "locked" && (
                                <span className="text-gray-700">
                                  🔒 Starts on {new Date(assignment.startDate).toLocaleDateString()}
                                </span>
                              )}
                              {status === "ended" && (
                                <span className="text-red-700">
                                  ⏰ Ended on {new Date(assignment.endDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 space-y-2 border border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">Class:</span>
                              <Badge className={`bg-gradient-to-r ${cardGradient} text-white border-0 font-semibold`}>
                                Grade {assignment.grade}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">Created:</span>
                              <span className="font-semibold text-gray-900">
                                {new Date(assignment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">Submissions:</span>
                              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-bold">
                                {assignment?.submittedStudents?.length || 0} 📝
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewScores(assignment._id)}
                              className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors font-semibold"
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Submissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/teacher/assignments/${assignment._id}/edit`)}
                              className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors font-semibold"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="px-3 bg-transparent hover:bg-red-50">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteassignment(assignment._id)}
                                  className="text-red-600 focus:text-red-600 cursor-pointer font-semibold"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex justify-center items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-800 font-semibold"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-700 font-bold">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-800 font-semibold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
