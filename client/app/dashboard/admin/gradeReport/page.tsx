"use client";
import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  GraduationCap,
  Users,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Calendar,
} from "lucide-react";
import {
  useGradeCompletionReport,
  useExportGradeReport,
} from "@/hooks/admin/useGradeReports";
import { GradeWithStats } from "@/types/admin/grade.types";
import {
  getCompletionColor,
  getCompletionStatus,
  getGradeGradient,
} from "@/utils/admin/grade.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function GradeCompletionReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const {
    data: reportData,
    isLoading,
    error,
  } = useGradeCompletionReport(currentPage, itemsPerPage, searchQuery);
  const exportMutation = useExportGradeReport();
  const grades = reportData?.data || [];
  const pagination = reportData?.pagination || {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: itemsPerPage,
  };
  const handleExportSingle = async (grade: GradeWithStats) => {
    await exportMutation.mutateAsync(grade);
  };
  const handleExportAll = async () => {
    await exportMutation.mutateAsync(undefined);
  };
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading grade reports...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg">
          <p className="text-red-600 mb-4">Failed to load grade reports</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-12 w-12 mr-4" />
            <h1 className="text-5xl font-bold">Comprehensive Grade Report</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Complete overview of chapters, assignments, and attendance
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-8">
        {}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search by grade or academic year..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-3 h-12 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <Button
            onClick={handleExportAll}
            disabled={exportMutation.isPending || grades.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Export All to Excel
              </>
            )}
          </Button>
        </div>
        {}
        {grades.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-xl">No grades found</p>
            <p className="text-slate-400 text-sm mt-2">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create grades to see reports"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {grades.map((grade: GradeWithStats, index: number) => {
              const status = getCompletionStatus(
                grade.averageChapterCompletion,
              );
              const gradient = getGradeGradient(index);
              return (
                <div
                  key={grade._id}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  <div className="p-6">
                    {}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div
                          className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
                        >
                          <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            Grade {grade.grade}
                          </h2>
                          {grade.academicYear && (
                            <p className="text-sm text-slate-500">
                              {grade.academicYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleExportSingle(grade)}
                        disabled={exportMutation.isPending}
                        size="sm"
                        variant="outline"
                        className="border-2 border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                    {}
                    <div className="mb-6 p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Teachers:
                      </p>
                      <p className="text-slate-800">
                        {grade.teachers && grade.teachers.length > 0
                          ? grade.teachers.join(", ")
                          : "No teachers assigned"}
                      </p>
                    </div>
                    {}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Users className="h-5 w-5 text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-blue-900">
                            Students
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {grade.totalStudents}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                          <p className="text-sm font-medium text-purple-900">
                            Chapters
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {grade.totalChapters}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <ClipboardCheck className="h-5 w-5 text-orange-600 mr-2" />
                          <p className="text-sm font-medium text-orange-900">
                            Assignments
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                          {grade.totalAssignments}
                        </p>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-teal-600 mr-2" />
                          <p className="text-sm font-medium text-teal-900">
                            Attendance
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-teal-600">
                          {grade.attendanceRate}%
                        </p>
                      </div>
                    </div>
                    {}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Chapter Progress
                      </h3>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-600">Completed</p>
                          <p className="text-lg font-bold text-green-600">
                            {grade.completedChapters}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">In Progress</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {grade.partiallyCompletedChapters}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Not Started</p>
                          <p className="text-lg font-bold text-red-600">
                            {grade.notStartedChapters}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Average Completion
                        </span>
                        <span className={`text-sm font-bold ${status.color}`}>
                          {grade.averageChapterCompletion}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCompletionColor(grade.averageChapterCompletion)} transition-all duration-500 rounded-full`}
                          style={{
                            width: `${grade.averageChapterCompletion}%`,
                          }}
                        />
                      </div>
                      <p className={`text-xs ${status.color} mt-1 font-medium`}>
                        {status.text}
                      </p>
                    </div>
                    {}
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <ClipboardCheck className="h-5 w-5 mr-2" />
                        Assignment Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-slate-600">Active</p>
                          <p className="text-lg font-bold text-green-600">
                            {grade.activeAssignments}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Submissions</p>
                          <p className="text-lg font-bold text-blue-600">
                            {grade.totalSubmissions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Graded</p>
                          <p className="text-lg font-bold text-purple-600">
                            {grade.gradedSubmissions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Avg Score</p>
                          <p className="text-lg font-bold text-indigo-600">
                            {grade.averageAssignmentScore}
                          </p>
                        </div>
                      </div>
                    </div>
                    {}
                    <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Attendance Overview
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-slate-600">Present</p>
                          <p className="text-lg font-bold text-green-600">
                            {grade.presentCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Absent</p>
                          <p className="text-lg font-bold text-red-600">
                            {grade.absentCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Late</p>
                          <p className="text-lg font-bold text-orange-600">
                            {grade.lateCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Excused</p>
                          <p className="text-lg font-bold text-blue-600">
                            {grade.excusedCount}
                          </p>
                        </div>
                      </div>
                    </div>
                    {}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          grade.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {grade.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-slate-500">
                        Updated:{" "}
                        {new Date(grade.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-xl shadow-lg">
            <div className="text-sm text-slate-600">
              Showing {grades.length} of {pagination.total} grades
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        className={`w-10 h-10 ${
                          currentPage === pageNum
                            ? "bg-indigo-500 text-white"
                            : "border-2"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
              </div>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                variant="outline"
                size="sm"
                className="border-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
