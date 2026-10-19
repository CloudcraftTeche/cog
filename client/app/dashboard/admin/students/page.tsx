"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useStudents,
  useGrades,
  useDeleteStudent,
  useBulkStudentsWithProgress,
  useStudentProgress,
} from "@/hooks/admin/useStudents";
import { Student } from "@/types/admin/student.types";
import {
  prepareExcelData,
  exportStudentsToExcel,
} from "@/utils/admin/student.utils";
import {
  DeleteConfirmDialog,
  StudentProgressModal,
} from "@/components/admin/students/StudentProgressModal";
import { StudentsTable } from "@/components/admin/students/StudentsTable";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function StudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    studentId: string | null;
  }>({ open: false, studentId: null });
  const [progressDialog, setProgressDialog] = useState<{
    open: boolean;
    student: Student | null;
  }>({ open: false, student: null });

  const inputRef = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(20);

  const { data: studentsData, isLoading, isFetching, error } = useStudents({
    query,
    page,
    limit,
    grade: selectedGrade || undefined,
  });

  const { data: grades = [] } = useGrades();
  const { data: studentProgress, isLoading: loadingProgress } =
    useStudentProgress(progressDialog.student?._id || null);
  const { refetch: fetchBulkData, isFetching: exportingExcel } =
    useBulkStudentsWithProgress({
      query,
      page: 1,
      limit: 100,
      grade: selectedGrade || undefined,
    });
  const deleteMutation = useDeleteStudent();

  const studentsList = studentsData?.data || [];
  const totalStudents = studentsData?.total || 0;
  const totalPages = studentsData?.totalPages || 1;

  const commitSearch = () => {
    setPage(1);
    setQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setQuery("");
    setPage(1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitSearch();
    if (e.key === "Escape") clearSearch();
  };

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
      const { summary, detailed } = prepareExcelData(studentsWithProgress, grades);
      exportStudentsToExcel(summary, detailed);
      toast.success("Excel file exported successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export Excel file");
      console.error("Export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-purple-700 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

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
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Exporting...</>
                ) : (
                  <><FileSpreadsheet className="h-5 w-5 mr-2" />Export Excel</>
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
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type and press Enter to search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-11 pr-10 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={commitSearch}
                  disabled={isFetching}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                >
                  {isFetching && !isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Search className="h-4 w-4" />
                  }
                  Search
                </button>
              </div>
              {query && (
                <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                  Results for <span className="font-semibold">"{query}"</span>
                  <button onClick={clearSearch} className="underline hover:no-underline ml-1">
                    Clear
                  </button>
                </p>
              )}
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

        {studentsList.length === 0 ? (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-16 text-center shadow-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No students found</p>
              <p className="text-gray-500 mt-2">
                {query
                  ? `No results for "${query}" — try a different search`
                  : "Try adjusting your filters"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <StudentsTable
              students={studentsList}
              grades={grades}
              startIndex={(page - 1) * limit}
              onViewProgress={handleViewProgress}
              onEdit={(student) => router.push(`/dashboard/admin/students/edit/${student._id}`)}
              onDelete={(student) => setDeleteDialog({ open: true, studentId: student._id })}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalStudents)} of {totalStudents}
                </span>
                <label className="flex items-center gap-2">
                  Rows per page
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium text-gray-700 shadow-sm transition-all"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-xl shadow-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium text-gray-700 shadow-sm transition-all"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
          onClose={() => setProgressDialog({ open: false, student: null })}
        />
      )}
    </div>
  );
}