"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Loader2,
  GraduationCap,
  BookOpen,
  Filter,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AssignmentCard } from "@/components/admin/assignments/AssignmentCard";
import { IAssignment } from "@/lib/assignmentValidation";
export default function SuperAdminAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/assignments", {
        params: {
          search: searchTerm,
          page,
          limit: 6,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      setAssignments(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast.error(
        error.response?.data?.message || "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user?.id) return;
    setPage(1);
  }, [searchTerm, statusFilter]);
  useEffect(() => {
    if (!user?.id) return;
    fetchAssignments();
  }, [user?.id, searchTerm, statusFilter, page]);
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete assignment"
      );
    }
  };
  const handleViewSubmissions = (assignmentId: string) => {
    router.push(`/dashboard/super-admin/assignments/submissions/${assignmentId}`);
  };
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => {
    const now = new Date();
    const start = new Date(a.startDate);
    const end = new Date(a.endDate);
    return now >= start && now <= end;
  }).length;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl mb-6">
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                      Assignments Hub
                    </h1>
                    <p className="text-blue-100 text-lg mt-1">
                      Manage and track all assignments across grades
                    </p>
                  </div>
                </div>
                {}
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs font-medium">
                          Total Assignments
                        </p>
                        <p className="text-2xl font-bold">{totalAssignments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs font-medium">
                          Active Now
                        </p>
                        <p className="text-2xl font-bold">
                          {activeAssignments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                className="w-full lg:w-auto bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() =>
                  router.push("/dashboard/super-admin/assignments/create")
                }
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Assignment
              </Button>
            </div>
          </div>
          {}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search Assignments
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl"
                  />
                </div>
              </div>
              <div className="lg:w-56">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Status Filter
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="locked">Scheduled</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {}
            {(searchTerm || statusFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  Active Filters:
                </span>
                {searchTerm && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    Status: {statusFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-xs ml-auto"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
        {}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                Loading assignments...
              </p>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <GraduationCap className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              {searchTerm ? "No results found" : "No assignments yet"}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first assignment to get started"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() =>
                  router.push("/dashboard/super-admin/assignments/create")
                }
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Assignment
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onDelete={handleDeleteAssignment}
                  onViewSubmissions={handleViewSubmissions}
                />
              ))}
            </div>
            {}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
