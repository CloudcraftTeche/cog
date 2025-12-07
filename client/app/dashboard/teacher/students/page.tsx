"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { StudentCard } from "@/components/teacher/students/StudentCard";
import { DeleteStudentDialog } from "@/components/teacher/students/DeleteStudentDialog";
import { StudentProgressDialog } from "@/components/teacher/students/StudentProgressDialog";
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
export default function TeacherStudentsPage() {
  const router = useRouter();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [query, setQuery] = useState("");
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
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students/teacher/students", {
        params: {
          query,
          page,
          limit,
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
  const fetchStudentProgress = async (studentId: string) => {
    try {
      setLoadingProgress(true);
      const response = await api.get(
        `/students/teacher/students/${studentId}/progress`
      );
      setStudentProgress(response.data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch progress");
    } finally {
      setLoadingProgress(false);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, [page, query]);
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
      await api.delete(`/students/teacher/students/${deleteDialog.studentId}`);
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
        {}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-10 w-10" />
                <h1 className="text-4xl font-bold">My Students</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Manage your grade students ({totalStudents} total)
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/teacher/students/add")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Student
            </button>
          </div>
        </div>
        {}
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
          </div>
        </div>
        {}
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
        {}
        {!loading && (
          <>
            {studentsList.length === 0 ? (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-16 text-center shadow-lg border border-gray-200">
                <div className="max-w-md mx-auto">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No students found</p>
                  <p className="text-gray-500 mt-2">
                    {query
                      ? "Try adjusting your search"
                      : "Start by adding your first student"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentsList.map((student, index) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    gradient={cardGradients[index % cardGradients.length]}
                    dropdownOpen={dropdownOpen === student._id}
                    onDropdownToggle={() =>
                      setDropdownOpen(
                        dropdownOpen === student._id ? null : student._id
                      )
                    }
                    onViewProgress={() => handleViewProgress(student)}
                    onEdit={() =>
                      router.push(
                        `/dashboard/teacher/students/edit/${student._id}`
                      )
                    }
                    onDelete={() =>
                      setDeleteDialog({ open: true, studentId: student._id })
                    }
                    onCloseDropdown={() => setDropdownOpen(null)}
                  />
                ))}
              </div>
            )}
            {}
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
      {}
      <DeleteStudentDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, studentId: null })}
        onConfirm={handleDeleteStudent}
      />
      {}
      <StudentProgressDialog
        open={progressDialog.open}
        student={progressDialog.student}
        progress={studentProgress}
        loading={loadingProgress}
        onClose={() => {
          setProgressDialog({ open: false, student: null });
          setStudentProgress(null);
        }}
      />
    </div>
  );
}
