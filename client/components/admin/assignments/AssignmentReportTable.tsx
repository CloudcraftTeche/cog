"use client";
import { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  GraduationCap,
  ListFilter,
  Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAssignmentReport,
  useExportAssignmentReport,
} from "@/hooks/admin/useAssignmentReport";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/lib/admin/api/assignment.service";
import { ASSIGNMENT_QUERY_KEYS } from "@/hooks/admin/useAssignments";

export function AssignmentReportTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [pageSize, setPageSize] = useState<string>("10");
  const limit = pageSize === "all" ? "all" : parseInt(pageSize, 10);

  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.grades,
    queryFn: assignmentService.getGrades,
  });

  const { rows, pagination, loading, page, setPage } = useAssignmentReport({
    search: searchTerm,
    grade: gradeFilter,
    status: statusFilter,
    limit,
  });

  const exportMutation = useExportAssignmentReport();

  const handleExport = () => {
    exportMutation.mutate({
      search: searchTerm,
      grade: gradeFilter,
      status: statusFilter,
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6 space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              <Search className="h-4 w-4 inline mr-2" />
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by student, grade, or assignment name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                <GraduationCap className="h-4 w-4 inline mr-2" />
                Grade
              </Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl w-full">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {gradesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading grades...
                    </SelectItem>
                  ) : (
                    grades.map((grade) => (
                      <SelectItem key={grade._id} value={grade._id}>
                        {grade.grade}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                <ListFilter className="h-4 w-4 inline mr-2" />
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                <Rows3 className="h-4 w-4 inline mr-2" />
                Rows per page
              </Label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl w-full">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending || rows.length === 0}
              className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl"
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              Export Excel
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16">
              <FileSpreadsheet className="h-14 w-14 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                No assignment records found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Review Suggestion</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Attachment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.assignmentId}_${row.studentId}`}>
                    <TableCell className="font-medium">
                      {row.studentName}
                    </TableCell>
                    <TableCell>{row.gradeName}</TableCell>
                    <TableCell>{row.assignmentName}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {row.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.marks !== null
                        ? `${row.marks}${row.totalMarks ? ` / ${row.totalMarks}` : ""}`
                        : "-"}
                    </TableCell>
                    <TableCell
                      className="max-w-[220px] truncate"
                      title={row.feedback || ""}
                    >
                      {row.feedback || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(row.assignmentCreatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {row.submittedAt
                        ? new Date(row.submittedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {row.attachmentUrl ? (
                        <a
                          href={row.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <Paperclip className="h-4 w-4" />
                          Download
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pageSize === "all" && rows.length > 0 && (
          <div className="text-sm text-slate-600 mt-4 text-center">
            Showing all {pagination.total} records
          </div>
        )}

        {pagination && pageSize !== "all" && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-lg">
            <div className="text-sm text-slate-600">
              Showing {rows.length} of {pagination.total} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-slate-600 px-2">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() =>
                  setPage(Math.min(pagination.totalPages, page + 1))
                }
                disabled={page === pagination.totalPages}
                variant="outline"
                size="sm"
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
