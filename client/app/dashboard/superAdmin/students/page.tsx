"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Mail,
  GraduationCap,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface StudentResponse {
  success: boolean
  total: number
  data: Student[]
}

export default function StudentsPage() {
  const router = useRouter()
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(6)
  const [query, setQuery] = useState("")
  const [grades, setGrades] = useState<string[]>([])
  const [grade, setGrade] = useState("")

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await api.get<StudentResponse>(`/student`, {
        params: {
          query,
          page,
          limit,
          grade: grade || undefined,
        },
      })
      const { data: students, total } = response.data
      setStudentsList(students)
      setTotalStudents(total)
    } catch (error) {
      toast.error("Failed to fetch students.")
    } finally {
      setLoading(false)
    }
  }

  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades/all")
      setGrades(res.data.data || [])
    } catch (error) {
      toast.error("Error fetching data:")
    }
  }

  useEffect(() => {
    Promise.all([fetchGrades(), fetchStudents()])
  }, [page, query, grade])

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/student/${studentId}`)
      toast.success("Student deleted.")
      setStudentsList((prev) => prev.filter((s) => s._id !== studentId))
      setTotalStudents((prev) => prev - 1)
    } catch (error) {
      toast.error("Failed to delete student.")
    }
  }

  const totalPages = Math.ceil(totalStudents / limit)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
        <div className=" relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Students
            </h1>
            <p className="text-purple-100 text-lg mt-2">Manage your students ({totalStudents} total)</p>
          </div>
          <Button
              className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-2xl"
              onClick={() => router.push("/dashboard/admin/students/add")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Student
            </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-4">
          <div className="max-w-md flex items-center gap-3 bg-white rounded-xl p-3 shadow-md border border-blue-200">
            <Search className="text-blue-500 h-5 w-5" />
            <Input
              placeholder="Search students..."
              value={query}
              onChange={handleSearchChange}
              className="border-0 focus:ring-0 bg-transparent"
            />
          </div>
          <div className="flex sm:flex-row flex-col sm:gap-8 gap-4 sm:items-center items-start">
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-blue-700 font-medium">
                Grade
              </Label>
              <Select value={grade} onValueChange={(value) => setGrade(value)}>
                <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(({ grade }: any) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            <span className="ml-2 text-purple-700 font-medium">Loading students...</span>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {studentsList.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                <p className="text-gray-600 text-lg">No students found.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentsList.map((student, index) => {
                const gradientVariations = [
                  "from-rose-50 to-pink-100 border-rose-200",
                  "from-blue-50 to-indigo-100 border-blue-200",
                  "from-emerald-50 to-teal-100 border-emerald-200",
                  "from-amber-50 to-orange-100 border-amber-200",
                  "from-purple-50 to-violet-100 border-purple-200",
                  "from-cyan-50 to-sky-100 border-cyan-200",
                ]
                const cardGradient = gradientVariations[index % gradientVariations.length]

                return (
                  <Card
                    key={student?._id}
                    className={`bg-gradient-to-br ${cardGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                            <AvatarImage src={student.profilePictureUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"} alt={student.name} />
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
                              {student.class}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-white/50 rounded-full">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white shadow-xl border-0 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/admin/students/${student._id}`)}
                              className="hover:bg-blue-50 text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/admin/students/${student._id}/edit`)}
                              className="hover:bg-green-50 text-green-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteStudent(student._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-700 bg-white/60 rounded-xl p-3 shadow-sm">
                          <Mail className="h-5 w-5 mr-3 text-blue-500" />
                          <span className="text-sm font-medium">Email: {student.email}</span>
                        </div>
                        <div className="flex items-center text-gray-700 bg-white/60 rounded-xl p-3 shadow-sm">
                          <GraduationCap className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="text-sm font-medium">Grade: {student.class}</span>
                        </div>
                        <div className="pt-3">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            onClick={() => router.push(`/dashboard/admin/students/${student._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 hover:from-gray-100 hover:to-slate-100 shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-200 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 hover:from-gray-100 hover:to-slate-100 shadow-md"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
