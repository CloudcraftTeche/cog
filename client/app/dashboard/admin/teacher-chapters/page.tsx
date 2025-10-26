"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Video,
  FileText,
  Loader2,
  Sparkles,
  Users,
  BookOpen,
} from "lucide-react";

interface TeacherChapter {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text";
  grade: string;
  unit: string;
  chapterNumber: number;
  questions?: any[];
  completedTeachers: string[];
  createdAt: string;
  updatedAt: string;
}

interface Grade {
  grade: string;
  _id: string;
}

interface Unit {
  unit: string;
  _id: string;
}

export default function AdminTeacherChaptersPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<TeacherChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (selectedGrade !== "all") params.grade = selectedGrade;
      if (selectedUnit !== "all") params.unit = selectedUnit;
      if (selectedChapter !== "all") params.chapter = selectedChapter;

      const response = await api.get("/teacher-chapter", { params });
      const data = response.data;
      setChapters(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load teacher chapters");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [gradesRes, unitsRes] = await Promise.all([
        api.get("/grades/all"),
        api.get("/units/all"),
      ]);
      setGrades(gradesRes.data.data || []);
      setUnits(unitsRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load filters");
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [page, search, selectedGrade, selectedUnit, selectedChapter]);

  const handleDelete = async () => {
    if (!chapterToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/teacher-chapter/${chapterToDelete}`);
      toast.success("Chapter deleted successfully");
      fetchChapters();
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete chapter");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setChapterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const chapterNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-float blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <header className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 rounded-3xl shadow-2xl">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Teacher Training Chapters</h1>
                  </div>
                  <p className="text-indigo-100 text-lg">
                    Manage professional development content for teachers
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/dashboard/admin/teacher-chapters/upload")}
                  className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Content
                </Button>
              </div>
            </div>
          </div>
        </header>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                All Teacher Chapters
              </CardTitle>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search chapters..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                  />
                </div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-full md:w-32 border-2 border-gray-200 focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((g) => (
                      <SelectItem key={g._id} value={g.grade}>
                        Grade {g.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-full md:w-32 border-2 border-gray-200 focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {units.map((u) => (
                      <SelectItem key={u._id} value={u.unit}>
                        Unit {u.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                  <SelectTrigger className="w-full md:w-32 border-2 border-gray-200 focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chapters</SelectItem>
                    {chapterNumbers.map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        Chapter {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-pulse">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Loading chapters...</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-800 font-bold text-xl mb-2">No chapters found</p>
                <p className="text-gray-500 mb-6">
                  {search || selectedGrade !== "all" || selectedUnit !== "all" || selectedChapter !== "all"
                    ? "Try adjusting your filters"
                    : "Start by uploading your first teacher training chapter"}
                </p>
                {!search && selectedGrade === "all" && selectedUnit === "all" && selectedChapter === "all" && (
                  <Button
                    onClick={() => router.push("/dashboard/admin/teacher-chapters/upload")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload First Chapter
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200">
                        <TableHead className="font-bold text-gray-700">Title</TableHead>
                        <TableHead className="font-bold text-gray-700">Grade</TableHead>
                        <TableHead className="font-bold text-gray-700">Unit</TableHead>
                        <TableHead className="font-bold text-gray-700">Chapter</TableHead>
                        <TableHead className="font-bold text-gray-700">Type</TableHead>
                        <TableHead className="font-bold text-gray-700">Quiz</TableHead>
                        <TableHead className="font-bold text-gray-700">Completed</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapters.map((chapter) => (
                        <TableRow
                          key={chapter._id}
                          className="hover:bg-purple-50/50 transition-colors"
                        >
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  chapter.contentType === "video"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-emerald-100 text-emerald-600"
                                }`}
                              >
                                {chapter.contentType === "video" ? (
                                  <Video className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">
                                  {chapter.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                  {chapter.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 border-0">
                              Grade {chapter.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              Unit {chapter.unit}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              Ch. {chapter.chapterNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                chapter.contentType === "video"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }
                            >
                              {chapter.contentType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {chapter.questions && chapter.questions.length > 0 ? (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                {chapter.questions.length} Questions
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                No Quiz
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">
                                {chapter.completedTeachers?.length || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-purple-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/admin/teacher-chapters/${chapter._id}`
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/admin/teacher-chapters/${chapter?._id}/edit`
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(chapter._id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={
                            p === page
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 rounded-lg"
                              : "border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg"
                          }
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Chapter?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the chapter and
              remove all associated data including teacher progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-2 border-gray-200 hover:bg-gray-50 rounded-xl"
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Chapter"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}