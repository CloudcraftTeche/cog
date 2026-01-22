// app/dashboard/admin/students/page.tsx
"use client";

import { useState } from "react";
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
  BookOpen,
  Award,
  TrendingUp,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

// TanStack Query Hooks
import {
  useStudents,
  useGrades,
  useDeleteStudent,
  useBulkStudentsWithProgress,
  useStudentProgress,
} from "@/hooks/admin/useStudents";

// Types
import { Student } from "@/types/admin/student.types";

// Utils
import {
  getInitials,
  formatDate,
  getCardGradient,
  prepareExcelData,
  exportStudentsToExcel,
} from "@/utils/admin/student.utils";
import { DeleteConfirmDialog, StudentProgressModal } from "@/components/admin/students/StudentProgressModal";

// Components

export default function StudentsPage() {
  const router = useRouter();

  // ===== LOCAL STATE =====
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
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

  const limit = 6;

  // ===== QUERIES =====
  const {
    data: studentsData,
    isLoading,
    error,
  } = useStudents({
    query,
    page,
    limit,
    grade: selectedGrade || undefined,
  });

  const { data: grades = [] } = useGrades();

  const {
    data: studentProgress,
    isLoading: loadingProgress,
  } = useStudentProgress(progressDialog.student?._id || null);

  const { refetch: fetchBulkData, isFetching: exportingExcel } =
    useBulkStudentsWithProgress({
      query,
      page: 1,
      limit: 100,
      grade: selectedGrade || undefined,
    });

  // ===== MUTATIONS =====
  const deleteMutation = useDeleteStudent();

  // ===== DERIVED STATE =====
  const studentsList = studentsData?.data || [];
  const totalStudents = studentsData?.total || 0;
  const totalPages = studentsData?.totalPages || 1;

  // ===== HANDLERS =====
  const handleDeleteStudent = async () => {
    if (!deleteDialog.studentId) return;
    await deleteMutation.mutateAsync(deleteDialog.studentId);
    setDeleteDialog({ open: false, studentId: null });
  };

  const handleViewProgress = (student: Student) => {
    setProgressDialog({ open: true, student });
  };

  const handleExportToExcel = async () => {
    try {
      toast.info("Preparing Excel export...");

      const result = await fetchBulkData();
      const studentsWithProgress = result.data || [];

      if (studentsWithProgress.length === 0) {
        toast.error("No students to export");
        return;
      }

      const { summary, detailed } = prepareExcelData(
        studentsWithProgress,
        grades
      );

      exportStudentsToExcel(summary, detailed);
      toast.success("Excel file exported successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export Excel file");
      console.error("Export error:", error);
    }
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-purple-700 font-medium">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-red-600 mb-4">Failed to load students</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
                onClick={handleExportToExcel}
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

        {/* Filters */}
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

        {/* Students Grid */}
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
              const gradient = getCardGradient(index);
              return (
                <div
                  key={student._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
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

                    {/* Dropdown Menu */}
                    <div className="absolute top-4 right-4 dropdown-container">
                      <button
                        className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === student._id ? null : student._id
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

                  {/* Card Body */}
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
                            `/dashboard/admin/students/edit/${student._id}`
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

        {/* Pagination */}
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
      </div>

      {/* Modals */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, studentId: null })}
        onConfirm={handleDeleteStudent}
        isDeleting={deleteMutation.isPending}
      />

      {progressDialog.student && (
        <StudentProgressModal
          open={progressDialog.open}
          student={progressDialog.student}
          progress={studentProgress || null}
          isLoading={loadingProgress}
          onClose={() => {
            setProgressDialog({ open: false, student: null });
          }}
        />
      )}
    </div>
  );
}