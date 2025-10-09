"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Video,
  FileText,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  grade: number;
  contentType: "video" | "text" | "pdf";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  submittedStudents: string[];
}

const ITEMS_PER_PAGE = 6;

export default function AdminAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [grades, setGrades] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState("");

  const fetchassignments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assignment`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          grade: selectedGrade,
        },
      });
      const { data = [], total = 0 } = response.data;

      setAssignments(data);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
    } catch (error) {
      toast.error("Something went wrong while fetching assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const response = await api.get("/grades/all");
        const data = response.data.data;
        setGrades(data);
        await fetchassignments();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user?.id, currentPage, searchTerm, selectedGrade]);

  const handleDeleteassignment = async (assignmentId: string) => {
    try {
      await api.delete(`/assignment/${assignmentId}`);
      toast.success("assignment deleted successfully.");
      fetchassignments();
    } catch (error) {
      toast.error("Failed to delete assignment. Try again.");
    }
  };

  const handleViewScores = (assignmentId: string) => {
    router.push(`/dashboard/admin/assignments/${assignmentId}/submissions`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);

    if (now < startDate) return "locked";
    if (now > endDate) return "ended";
    return "active";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
          color: "text-green-600",
          gradient: "from-green-400 to-emerald-500",
        };
      case "locked":
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Lock,
          color: "text-gray-600",
          gradient: "from-gray-400 to-slate-500",
        };
      case "ended":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
          color: "text-red-600",
          gradient: "from-red-400 to-rose-500",
        };
      default:
        return {
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          icon: Clock,
          color: "text-blue-600",
          gradient: "from-blue-400 to-indigo-500",
        };
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Assignments Management
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Manage your Assignments and track student progress
                </p>
              </div>
              <Button
                className="w-full lg:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
                onClick={() =>
                  router.push("/dashboard/admin/assignments/upload")
                }
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Assignment
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="max-w-md flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Search className="text-white h-5 w-5" />
            </div>
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={handleSearch}
              className="border-0 bg-transparent focus:ring-0 text-lg"
            />
          </div>
          <div className="flex sm:flex-row flex-col sm:gap-6 gap-4 sm:items-center items-start">
            <div className="space-y-2">
              <Label
                htmlFor="grade"
                className="text-sm font-semibold text-gray-700"
              >
                Grade
              </Label>
              <Select
                value={selectedGrade}
                onValueChange={(value) => setSelectedGrade(value)}
              >
                <SelectTrigger className="bg-white border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(({ grade }) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No assignments found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first assignment
                </p>
                <Button
                  onClick={() => router.push("/dashboard/admin/upload")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create assignment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {assignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const statusConfig = getStatusConfig(status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Card
                      key={assignment._id}
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div
                          className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`}
                        ></div>
                        <div className="p-6 space-y-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                                assignment.contentType === "video"
                                  ? "bg-gradient-to-r from-red-500 to-pink-600"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
                              }`}
                            >
                              {assignment.contentType === "video" ? (
                                <Video className="h-7 w-7 text-white" />
                              ) : (
                                <FileText className="h-7 w-7 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                  {assignment?.title}
                                </h3>
                                <Badge
                                  className={`capitalize text-xs ${
                                    assignment.contentType === "video"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-blue-100 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {assignment.contentType}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                {assignment?.description}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                              <StatusIcon
                                className={`h-5 w-5 ${statusConfig.color}`}
                              />
                              <Badge
                                className={`${statusConfig.badge} font-medium`}
                              >
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {status === "active" && (
                                <span className="text-green-700 font-medium">
                                  Assignment is currently active for students
                                </span>
                              )}
                              {status === "locked" && (
                                <span className="text-gray-700">
                                  Starts on
                                  {new Date(
                                    assignment.startDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {status === "ended" && (
                                <span className="text-red-700">
                                  Ended on
                                  {new Date(
                                    assignment.endDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Class:</span>
                              <span className="font-medium text-gray-900">
                                {assignment.grade}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Created:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(
                                  assignment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Submitted:</span>
                              <span className="font-medium text-gray-900">
                                {assignment?.submittedStudents?.length || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewScores(assignment._id)}
                              className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Submissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/assignments/${assignment._id}/edit`
                                )
                              }
                              className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="px-3 bg-transparent"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteassignment(assignment._id)
                                  }
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Delete assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
