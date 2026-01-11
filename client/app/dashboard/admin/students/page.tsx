"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Award,
  TrendingUp,
  User,
  FileSpreadsheet,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  gradeId?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  parentContact?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  profilePictureUrl?: string;
  role: string;
}
interface StudentProgress {
  totalChapters: number;
  completedCount: number;
  notCompletedChapters: number;
  completionPercentage: number;
  completedChapters: Array<{
    chapterId: string;
    chapterTitle: string;
    chapterNumber: number;
    completedAt: string;
    score?: number;
  }>;
}
interface Grade {
  _id: string;
  grade: string;
}
export default function StudentsPage() {
  const router = useRouter();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [query, setQuery] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    studentId: string | null;
  }>({
    open: false,
    studentId: null,
  });
  const [progressDialog, setProgressDialog] = useState<{
    open: boolean;
    student: Student | null;
  }>({
    open: false,
    student: null,
  });
  const [studentProgress, setStudentProgress] =
    useState<StudentProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students", {
        params: {
          query,
          page,
          limit,
          grade: selectedGrade || undefined,
        },
      });
      setStudentsList(response.data.data);
      setTotalStudents(response.data.total);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };
  const fetchGrades = async () => {
    try {
      const res = await api.get("/grades/all");
      setGrades(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch grades");
    }
  };
  const fetchStudentProgress = async (studentId: string) => {
    try {
      setLoadingProgress(true);
      const response = await api.get(`/students/${studentId}/progress`);
      setStudentProgress(response.data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch progress");
    } finally {
      setLoadingProgress(false);
    }
  };
  const exportToExcel = async () => {
    try {
      setExportingExcel(true);
      toast.info("Preparing Excel export...");
      const allStudentsResponse = await api.get("/students", {
        params: {
          query,
          grade: selectedGrade || undefined,
          limit: 1000,
        },
      });
      const allStudents = allStudentsResponse.data.data;
      const studentsWithProgress = await Promise.all(
        allStudents.map(async (student: Student) => {
          try {
            const progressResponse = await api.get(
              `/students/${student._id}/progress`
            );
            return {
              student,
              progress: progressResponse.data.data,
            };
          } catch (error) {
            return {
              student,
              progress: null,
            };
          }
        })
      );
      const excelData = studentsWithProgress.map(({ student, progress }) => {
        const gradeName =
          grades.find((g) => g._id === student.gradeId)?.grade || "N/A";
        return {
          Name: student.name,
          "Roll Number": student.rollNumber || "N/A",
          Email: student.email,
          Grade: gradeName,
          Gender: student.gender || "N/A",
          "Date of Birth": student.dateOfBirth
            ? new Date(student.dateOfBirth).toLocaleDateString()
            : "N/A",
          "Parent Contact": student.parentContact || "N/A",
          Address: student.address
            ? `${student.address.street || ""}, ${student.address.city || ""}, ${student.address.state || ""}, ${student.address.country || ""} ${student.address.postalCode || ""}`.trim()
            : "N/A",
          "Total Chapters": progress?.totalChapters || 0,
          "Completed Chapters": progress?.completedCount || 0,
          "Remaining Chapters": progress?.notCompletedChapters || 0,
          "Completion Percentage": progress?.completionPercentage
            ? `${progress.completionPercentage}%`
            : "0%",
        };
      });
      const detailedData: any[] = [];
      studentsWithProgress.forEach(({ student, progress }) => {
        if (progress && progress.completedChapters.length > 0) {
          progress.completedChapters.forEach((chapter: any) => {
            detailedData.push({
              "Student Name": student.name,
              "Roll Number": student.rollNumber || "N/A",
              "Chapter Number": chapter.chapterNumber,
              "Chapter Title": chapter.chapterTitle,
              "Completed Date": new Date(
                chapter.completedAt
              ).toLocaleDateString(),
              Score: chapter.score !== undefined ? `${chapter.score}%` : "N/A",
            });
          });
        }
      });
      const wb = XLSX.utils.book_new();
      const summaryWs = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Students Summary");
      if (detailedData.length > 0) {
        const detailedWs = XLSX.utils.json_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(wb, detailedWs, "Detailed Progress");
      }
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `students_progress_${timestamp}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success("Excel file exported successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export Excel file");
      console.error("Export error:", error);
    } finally {
      setExportingExcel(false);
    }
  };
  useEffect(() => {
    fetchGrades();
  }, []);
  useEffect(() => {
    fetchStudents();
  }, [page, query, selectedGrade]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const handleDeleteStudent = async () => {
    if (!deleteDialog.studentId) return;
    try {
      await api.delete(`/students/${deleteDialog.studentId}`);
      toast.success("Student deleted successfully");
      setStudentsList((prev) =>
        prev.filter((s) => s._id !== deleteDialog.studentId)
      );
      setTotalStudents((prev) => prev - 1);
      setDeleteDialog({ open: false, studentId: null });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete student");
    }
  };
  const handleViewProgress = (student: Student) => {
    setProgressDialog({ open: true, student });
    fetchStudentProgress(student._id);
  };
  const totalPages = Math.ceil(totalStudents / limit);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const cardGradients = [
    "from-rose-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-violet-500",
    "from-cyan-400 to-sky-500",
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">Students</h1>
              <p className="text-purple-100 text-lg mt-2">
                Manage and track your students ({totalStudents} total)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={exportingExcel || totalStudents === 0}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {exportingExcel ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Export Excel
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/dashboard/admin/students/add")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Student
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-blue-900 mb-2 block">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="w-full lg:w-64">
              <label className="text-sm font-medium text-blue-900 mb-2 block">
                Filter by Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade._id} value={grade._id}>
                    {grade.grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
              <p className="mt-4 text-purple-700 font-medium">
                Loading students...
              </p>
            </div>
          </div>
        )}
        
        {!loading && (
          <>
            {studentsList.length === 0 ? (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-16 text-center shadow-lg border border-gray-200">
                <div className="max-w-md mx-auto">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No students found</p>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentsList.map((student, index) => {
                  const gradient = cardGradients[index % cardGradients.length];
                  return (
                    <div
                      key={student._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
                    >
                      
                      <div
                        className={`h-24 bg-gradient-to-r ${gradient} relative`}
                      >
                        <div className="absolute -bottom-10 left-6">
                          <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-xl">
                            {student.profilePictureUrl ? (
                              <img
                                src={student.profilePictureUrl}
                                alt={student.name}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div
                                className={`h-full w-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold`}
                              >
                                {getInitials(student.name)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 dropdown-container">
                          <button
                            className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === student._id
                                  ? null
                                  : student._id
                              )
                            }
                          >
                            <MoreHorizontal className="h-5 w-5 text-white" />
                          </button>
                          {dropdownOpen === student._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-10 overflow-hidden">
                              <button
                                className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center text-gray-700 transition-colors"
                                onClick={() => {
                                  handleViewProgress(student);
                                  setDropdownOpen(null);
                                }}
                              >
                                <TrendingUp className="h-4 w-4 mr-3 text-purple-500" />
                                View Progress
                              </button>
                              <button
                                className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center text-gray-700 transition-colors"
                                onClick={() => {
                                  router.push(
                                    `/dashboard/admin/students/edit/${student._id}`
                                  );
                                  setDropdownOpen(null);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-3 text-green-500" />
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center text-red-600 transition-colors"
                                onClick={() => {
                                  setDeleteDialog({
                                    open: true,
                                    studentId: student._id,
                                  });
                                  setDropdownOpen(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-14 px-6 pb-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {student.name}
                          </h3>
                          {student.rollNumber && (
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-medium rounded-full">
                              Roll: {student.rollNumber}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <Mail className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </div>
                          {student.parentContact && (
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              <Phone className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                              <span>{student.parentContact}</span>
                            </div>
                          )}
                          {student.gradeId && (
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              <BookOpen className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                              <span>
                                Grade:{" "}
                                {grades.find((g) => g._id === student.gradeId)
                                  ?.grade || student.gradeId}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 font-medium rounded-xl transition-all flex items-center justify-center shadow-sm"
                            onClick={() => handleViewProgress(student)}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Progress
                          </button>
                          <button
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/students/edit/${student?._id}`
                              )
                            }
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium text-gray-700 shadow-sm transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                <span className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-xl shadow-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium text-gray-700 shadow-sm transition-all"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete Student
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this student? This action cannot
              be undone and will remove all associated data including progress
              tracking.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteDialog({ open: false, studentId: null })
                }
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {progressDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Student Progress
                  </h2>
                  <p className="text-purple-100 mt-1">
                    {progressDialog.student?.name}'s learning journey
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProgressDialog({ open: false, student: null });
                    setStudentProgress(null);
                  }}
                  className="h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
              {loadingProgress ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600">Loading progress data...</p>
                </div>
              ) : studentProgress ? (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center shadow-sm">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-600">
                        {studentProgress.totalChapters}
                      </div>
                      <div className="text-sm text-blue-700 font-medium mt-1">
                        Total Chapters
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center shadow-sm">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600">
                        {studentProgress.completedCount}
                      </div>
                      <div className="text-sm text-green-700 font-medium mt-1">
                        Completed
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center shadow-sm">
                      <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-orange-600">
                        {studentProgress.notCompletedChapters}
                      </div>
                      <div className="text-sm text-orange-700 font-medium mt-1">
                        Remaining
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-semibold text-gray-700">
                        Overall Progress
                      </span>
                      <span className="text-purple-600 font-bold text-lg">
                        {studentProgress.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-md"
                        style={{
                          width: `${studentProgress.completionPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                  
                  {studentProgress.completedChapters.length > 0 ? (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-purple-600" />
                        Completed Chapters
                      </h4>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {studentProgress.completedChapters.map(
                          (chapter, index) => (
                            <div
                              key={chapter.chapterId}
                              className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      {chapter.chapterNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-gray-900 mb-1">
                                        {chapter.chapterTitle}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        Completed:{" "}
                                        {formatDate(chapter.completedAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {chapter.score !== undefined && (
                                  <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold rounded-lg text-sm whitespace-nowrap">
                                    {chapter.score}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-lg">
                        No chapters completed yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Progress will appear here once the student starts
                        completing chapters
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <X className="h-16 w-16 text-red-400 mx-auto mb-3" />
                  <p className="text-gray-600">Failed to load progress data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
