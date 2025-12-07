"use client"
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid3X3, List, Plus, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { IAssignment, ISubmission, UserRole } from "@/types/assignment.types";
import { AssignmentCard } from "./AssignmentCard";
interface AssignmentsGridProps {
  userRole?: UserRole;
}
export function AssignmentsGrid({ userRole = "student" }: AssignmentsGridProps) {
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const assignmentsRes = await api.get("/assignments");
      if (assignmentsRes.data.success) {
        setAssignments(assignmentsRes.data.data);
      }
      if (userRole === "student") {
        try {
          const student = JSON.parse(localStorage.getItem("user") || "{}");
          const gradeId = student.gradeId;
          if (gradeId) {
            const submissionsRes = await api.get(`/submissions?gradeId=${gradeId}`);
            if (submissionsRes.data.success) {
              const submitted = submissionsRes.data.data.map((s: ISubmission) =>
                typeof s.assignmentId === "object" ? s.assignmentId._id : s.assignmentId
              );
              setSubmittedIds(submitted);
            }
          }
        } catch (subError) {
          console.error("Error fetching submissions:", subError);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userRole]);
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      assignment.description.toLowerCase().includes(search.toLowerCase());
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = now >= startDate && now <= endDate && assignment.status === "active";
    } else if (statusFilter === "upcoming") {
      matchesStatus = now < startDate;
    } else if (statusFilter === "ended") {
      matchesStatus = now > endDate || assignment.status === "ended";
    } else if (statusFilter === "submitted" && userRole === "student") {
      matchesStatus = submittedIds.includes(assignment._id);
    } else if (statusFilter === "pending" && userRole === "student") {
      matchesStatus = !submittedIds.includes(assignment._id) && now >= startDate && now <= endDate;
    }
    const matchesContent = contentFilter === "all" || assignment.contentType === contentFilter;
    return matchesSearch && matchesStatus && matchesContent;
  });
  const LoadingSkeleton = () => (
    <div
      className={viewMode === "grid" ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
            Assignments
          </h1>
          <p className="text-gray-600 mt-1">
            {loading
              ? "Loading..."
              : `${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {(userRole === "teacher" || userRole === "admin") && (
            <Button asChild className="shadow-sm">
              <Link href="/assignments/create">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Assignment</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
      {}
      <div className="flex flex-col gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                {userRole === "student" && (
                  <>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="hidden sm:block">
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-2.5">
                  <Grid3X3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2.5">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      {}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-red-200 bg-red-50">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
      {loading && <LoadingSkeleton />}
      {!loading && !error && filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No assignments found</h3>
          <p className="text-gray-600 text-center max-w-md">
            {search || statusFilter !== "all" || contentFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "There are no assignments available at the moment"}
          </p>
        </div>
      ) : (
        !loading &&
        !error && (
          <div
            className={
              viewMode === "grid" ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"
            }
          >
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                userRole={userRole}
                isSubmitted={submittedIds.includes(assignment._id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
