"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Mail, GraduationCap, MoreHorizontal, Edit, Trash2, Eye, Loader2, Search, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

interface Student {
  _id: string
  name: string
  dateOfBirth: string
  class: string
  teacher: string
  place: string
  role: string
  email: string
  parentContact: string
  profilePictureUrl: string
}

export default function StudentsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 6
  const totalPages = Math.ceil(total / limit)

  const fetchStudents = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      const teacherRes = await api.get(`/teacher/${user.id}`)
      const grade = teacherRes?.data?.data?.classTeacherFor
      if (!grade) {
        toast.warning("You are not assigned to any class.")
        return
      }

      const response = await api.get(`/student/class/${grade}?query=${query}&page=${page}&limit=${limit}`)

      setStudentsList(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      toast.error("Failed to fetch students.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [user?.id, page, query])

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/student/${studentId}`)
      toast.success("Student deleted.")
      setStudentsList((prev) => prev.filter((s) => s._id !== studentId))
    } catch (error) {
      toast.error("Failed to delete student.")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">My Students</h1>
                    <p className="text-purple-100 text-lg">Manage and track your students ({total} total)</p>
                  </div>
                </div>
              </div>
              <Button
                className="bg-white text-purple-600 hover:bg-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold px-6 py-3"
                onClick={() => router.push("/dashboard/teacher/students/add")}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Student
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <Search className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Search Students</h3>
            </div>
            <Input
              placeholder="Search students by name, email, or roll number..."
              value={query}
              onChange={(e) => {
                setPage(1)
                setQuery(e.target.value)
              }}
              className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              </div>
              <p className="text-gray-600 font-medium">Loading your amazing students...</p>
            </div>
          </div>
        ) : studentsList.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mb-6 mx-auto">
              <GraduationCap className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No students found</h3>
            <p className="text-gray-600 mb-6 text-lg">Start building your classroom community!</p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
              onClick={() => router.push("/dashboard/teacher/students/add")}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Student
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentsList?.map((student, index) => {
                const gradients = [
                  "from-blue-400 to-blue-600",
                  "from-green-400 to-green-600",
                  "from-purple-400 to-purple-600",
                  "from-pink-400 to-pink-600",
                  "from-indigo-400 to-indigo-600",
                  "from-orange-400 to-orange-600",
                ]
                const gradient = gradients[index % gradients.length]

                return (
                  <Card
                    key={student._id}
                    className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden"
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                              <AvatarImage src={student.profilePictureUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"} alt={student.name} />
                              <AvatarFallback className={`bg-gradient-to-r ${gradient} text-white font-bold text-xl`}>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}
                            >
                              <GraduationCap className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                            <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 shadow-sm`}>
                              Class {student.class}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/teacher/students/${student._id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/teacher/students/${student._id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDeleteStudent(student._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center text-gray-700">
                          <Mail className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="text-sm font-medium">{student.email}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <GraduationCap className="h-4 w-4 mr-3 text-green-500" />
                          <span className="text-sm font-medium">Grade: {student.class}</span>
                        </div>
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold`}
                        onClick={() => router.push(`/dashboard/teacher/students/${student._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Student Profile
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                      className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-700 font-medium">
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800"
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
  )
}
