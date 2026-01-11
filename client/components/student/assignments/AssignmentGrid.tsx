"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  BookOpen,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { IAssignment, ISubmission, UserRole } from "@/types/assignment.types";
import { AssignmentCard } from "./AssignmentCard";
interface AssignmentsGridProps {
  userRole?: UserRole;
}
function LoadingSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-4"
      }
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 space-y-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function AssignmentsGrid({
  userRole = "student",
}: AssignmentsGridProps) {
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
    if (!process.env.NEXT_PUBLIC_SERVERURL) {
      setError(
        "API server URL not configured. Please set NEXT_PUBLIC_SERVERURL environment variable."
      );
      setLoading(false);
      return;
    }
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get("/assignments"),
        userRole === "student"
          ? api
              .get("/assignments/my/submissions/all")
              .catch(() => ({ data: { success: true, data: [] } }))
          : Promise.resolve({ data: { success: true, data: [] } }),
      ]);
      if (assignmentsRes.data.success) {
        setAssignments(assignmentsRes.data.data);
      }
      if (userRole === "student" && submissionsRes.data.success) {
        const submitted = submissionsRes.data.data.map((s: ISubmission) =>
          typeof s.assignmentId === "object"
            ? s.assignmentId._id
            : s.assignmentId
        );
        setSubmittedIds(submitted);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch assignments"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userRole]);
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.description.toLowerCase().includes(search.toLowerCase());
      const now = new Date();
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);
      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus =
          now >= startDate && now <= endDate && assignment.status === "active";
      } else if (statusFilter === "upcoming") {
        matchesStatus = now < startDate;
      } else if (statusFilter === "ended") {
        matchesStatus = now > endDate || assignment.status === "ended";
      } else if (statusFilter === "submitted" && userRole === "student") {
        matchesStatus = submittedIds.includes(assignment._id);
      } else if (statusFilter === "pending" && userRole === "student") {
        matchesStatus =
          !submittedIds.includes(assignment._id) &&
          now >= startDate &&
          now <= endDate;
      }
      const matchesContent =
        contentFilter === "all" || assignment.contentType === contentFilter;
      return matchesSearch && matchesStatus && matchesContent;
    });
  }, [
    assignments,
    search,
    statusFilter,
    contentFilter,
    userRole,
    submittedIds,
  ]);
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-info p-6 sm:p-8 text-primary-foreground">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                My Assignments
                <Sparkles className="w-6 h-6 text-warning" />
              </h1>
              <p className="text-primary-foreground/80 mt-1 text-sm sm:text-base">
                {loading
                  ? "Loading your assignments..."
                  : `${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={fetchData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {(userRole === "teacher" || userRole === "admin") && (
              <Button
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                asChild
              >
                <Link href="/assignments/create">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Assignment</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl shadow-primary/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-12 rounded-xl bg-background/50 border-border/50">
                <Filter className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
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
              <SelectTrigger className="w-full sm:w-[140px] h-12 rounded-xl bg-background/50 border-border/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "grid" | "list")}
              className="hidden sm:block"
            >
              <TabsList className="h-12 rounded-xl bg-background/50 p-1">
                <TabsTrigger
                  value="grid"
                  className="px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Grid3X3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      {}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-destructive/30 bg-destructive/5">
          <div className="p-4 rounded-full bg-destructive/10 mb-4">
            <BookOpen className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive font-semibold mb-2 text-center">
            {error}
          </p>
          <Button
            variant="outline"
            onClick={fetchData}
            className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
      {}
      {loading && <LoadingSkeleton viewMode={viewMode} />}
      {}
      {!loading && !error && filteredAssignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-transparent">
          <div className="p-5 rounded-full bg-gradient-to-br from-primary/20 to-info/20 mb-5">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No assignments found
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {search || statusFilter !== "all" || contentFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "There are no assignments available at the moment"}
          </p>
        </div>
      )}
      {}
      {!loading && !error && filteredAssignments.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4"
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
      )}
    </div>
  );
}
