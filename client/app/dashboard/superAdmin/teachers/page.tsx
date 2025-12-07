"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Phone,
  BookOpen,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

interface Teacher {
  _id: string
  name: string
  email: string
  password: string
  phone?: string
  gender?: "Male" | "Female" | "Other"
  dateOfBirth?: Date
  classTeacherFor: string
  qualifications?: string
  profilePictureUrl?: string
  profilePicturePublicId?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
}

export default function TeachersPage() {
  const router = useRouter()
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 6

  const fetchTeachers = async () => {
    try {
      const response = await api.get(`/teacher`, {
        params: { page, limit, query },
        headers: { "Content-Type": "application/json" },
      })
      const teachers: Teacher[] = response.data.data || []
      setTeachersList(teachers)
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error("Failed to load teachers list. Please try again.")
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [query, page])

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      await api.delete(`/teacher/${teacherId}`, {
        headers: { "Content-Type": "application/json" },
      })
      setTeachersList((prev) => prev.filter((t) => t._id !== teacherId))
      toast.success("Teacher deleted successfully.")
      fetchTeachers()
    } catch (error) {
      toast.error("Error deleting teacher. Please try again.")
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Teachers
                  </h1>
                  <p className="text-purple-100 text-lg">Manage your amazing teaching staff</p>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-2xl"
              onClick={() => router.push("/dashboard/admin/teachers/add")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Teacher
            </Button>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
            <Input
              placeholder="Search by name, email, or class..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="pl-12 pr-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/80 backdrop-blur-sm shadow-lg text-gray-700 placeholder:text-purple-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {teachersList?.map((teacher, index) => {
            const cardColors = [
              "from-blue-500 to-cyan-400",
              "from-purple-500 to-pink-400",
              "from-green-500 to-emerald-400",
              "from-orange-500 to-red-400",
              "from-indigo-500 to-purple-400",
              "from-teal-500 to-blue-400",
            ]
            const cardColor = cardColors[index % cardColors.length]

            return (
              <Card
                key={teacher._id}
                className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden hover:scale-105"
              >
                <CardHeader className="pb-4 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${cardColor} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  ></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className={`h-16 w-16 ring-4 ring-gradient-to-r ${cardColor} shadow-xl`}>
                          <AvatarImage src={teacher.profilePictureUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"} alt={teacher.name} />
                          <AvatarFallback className={`bg-gradient-to-r ${cardColor} text-white font-bold text-xl`}>
                            {teacher.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${cardColor} rounded-full border-2 border-white shadow-lg`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{teacher.name}</h3>
                        <Badge
                          className={`bg-gradient-to-r ${cardColor} text-white border-0 shadow-lg font-semibold px-3 py-1 rounded-full`}
                        >
                          Teacher
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full hover:bg-purple-100 transition-colors duration-200"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/admin/teachers/${teacher._id}`)}
                          className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/admin/teachers/${teacher._id}/edit`)}
                          className="rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
                          onClick={() => handleDeleteTeacher(teacher._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Email</p>
                        <p className="text-sm text-gray-700 font-medium truncate">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Phone</p>
                        <p className="text-sm text-gray-700 font-medium">{teacher.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Class Teacher</p>
                        <p className="text-sm text-gray-700 font-medium">{teacher.classTeacherFor}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        size="sm"
                        className={`w-full bg-gradient-to-r ${cardColor} hover:shadow-xl text-white border-0 rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-105`}
                        onClick={() => router.push(`/dashboard/admin/teachers/${teacher._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 py-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 px-6 py-3 font-semibold transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg font-bold">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 px-6 py-3 font-semibold transition-all duration-300"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
