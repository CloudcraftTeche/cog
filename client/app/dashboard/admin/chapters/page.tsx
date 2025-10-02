"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Video, FileText, MoreVertical, BarChart3, TrendingUp, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Chapter {
  _id: string
  title: string
  description: string
  chapterNumber: number
  contentType: "video" | "text"
  videoUrl?: string
  textContent?: string
  class: string
  unit: string
  createdAt: Date
  completedStudents?: string[]
}

const chaptersDown = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `Chapter ${i + 1}`,
}))

const ITEMS_PER_PAGE = 6

export default function AdminChaptersPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [grades, setGrades] = useState<{ grade: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [chapter, setChapter] = useState<number | "">("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [units, setUnits] = useState<string[]>([])
  const [selectedUnit, setSelectedUnit] = useState("")

  const fetchChapters = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/chapter`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          grade: selectedGrade,
          chapter: chapter,
          unit: selectedUnit,
        },
      })

      const { data: chaptersData = [], total = 0 } = data
      setChapters(chaptersData)
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE))
    } catch {
      toast.error("Something went wrong while fetching chapters.")
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await api.get("/units/all")
      setUnits(res.data.data || [])
    } catch (error) {
      toast.error("Error fetching units:")
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
    if (!user?.id) return
    Promise.all([fetchChapters(), fetchUnits(), fetchGrades()])
  }, [user?.id, currentPage, searchTerm, selectedGrade, chapter, selectedUnit])

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await api.delete(`/chapter/${chapterId}`)
      toast.success("Chapter deleted successfully.")
      fetchChapters()
    } catch {
      toast.error("Failed to delete chapter. Try again.")
    }
  }

  const handleViewScores = (chapterId: string) => {
    router.push(`/dashboard/admin/chapters/${chapterId}/scores`)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Chapter Management
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage your chapters and track student progress with ease
              </p>
            </div>
            <Button
              className="w-full lg:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              onClick={() => router.push("/dashboard/admin/upload")}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Chapter
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="max-w-md flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Search className="text-white h-5 w-5" />
            </div>
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={handleSearch}
              className="border-0 bg-transparent focus:ring-0 text-lg"
            />
          </div>
          <div className="flex sm:flex-row flex-col sm:gap-6 gap-4 sm:items-center items-start">
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-semibold text-gray-700">
                Grade
              </Label>
              <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)}>
                <SelectTrigger className="bg-white border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(({ grade }) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                Unit
              </Label>
              <Select value={selectedUnit} onValueChange={(value) => setSelectedUnit(value)}>
                <SelectTrigger className="bg-white border-2 border-green-200 focus:border-green-400 rounded-xl shadow-md">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(({ unit }: any) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter" className="text-sm font-semibold text-gray-700">
                Chapter Number
              </Label>
              <Select value={String(chapter)} onValueChange={(val) => setChapter(Number(val))}>
                <SelectTrigger className="bg-white border-2 border-orange-200 focus:border-orange-400 rounded-xl shadow-md">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chaptersDown.map(({ id, title }) => (
                    <SelectItem key={id} value={id}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-6 animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded-xl w-3/4" />
                        <div className="h-3 bg-gray-200 rounded-xl w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded-xl" />
                      <div className="h-3 bg-gray-200 rounded-xl w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No chapters found</h3>
                <p className="text-gray-600 mb-8 text-lg">Get started by creating your first chapter</p>
                <Button
                  onClick={() => router.push("/dashboard/admin/upload")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {chapters?.map((ch, index) => (
                  <Card
                    key={ch._id}
                    className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 bg-white overflow-hidden rounded-3xl group"
                  >
                    <CardContent className="p-0">
                      <div
                        className={`h-3 ${
                          ch.contentType === "video"
                            ? "bg-gradient-to-r from-red-400 via-pink-500 to-purple-500"
                            : "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"
                        }`}
                      />
                      <div className="p-8 space-y-6">
                        <div className="flex items-start gap-5">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transform group-hover:scale-110 transition-transform duration-300 ${
                              index % 4 === 0
                                ? "bg-gradient-to-br from-red-500 via-pink-500 to-purple-600"
                                : index % 4 === 1
                                  ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                                  : index % 4 === 2
                                    ? "bg-gradient-to-br from-green-500 via-teal-500 to-blue-600"
                                    : "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"
                            }`}
                          >
                            {ch.contentType === "video" ? (
                              <Video className="h-8 w-8 text-white" />
                            ) : (
                              <FileText className="h-8 w-8 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900 truncate">{ch.title}</h3>
                              <Badge
                                className={`capitalize text-sm font-semibold px-3 py-1 rounded-full ${
                                  ch.contentType === "video"
                                    ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
                                    : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                }`}
                              >
                                {ch.contentType}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{ch.description}</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4 space-y-2 text-sm border border-gray-100">
                          <InfoRow label="Class" value={ch.class} />
                          <InfoRow label="Chapter" value={ch.chapterNumber} />
                          <InfoRow label="Unit" value={ch.unit} />
                          <InfoRow label="Created" value={new Date(ch.createdAt).toLocaleDateString()} />
                          <InfoRow label="Students" value={`${ch.completedStudents?.length || 0} completed`} />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewScores(ch._id)}
                            className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 font-semibold rounded-xl transition-all duration-300"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Scores
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/admin/chapters/${ch._id}/edit`)}
                            className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-semibold rounded-xl transition-all duration-300"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0">
                              <DropdownMenuItem
                                onClick={() => handleDeleteChapter(ch._id)}
                                className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 rounded-lg"
                              >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Delete Chapter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:bg-purple-50 rounded-xl px-6 py-2 font-semibold transition-all duration-300"
                  >
                    Prev
                  </Button>
                  <div className="px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
                    <span className="text-sm font-semibold text-purple-800">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:bg-purple-50 rounded-xl px-6 py-2 font-semibold transition-all duration-300"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  )
}
