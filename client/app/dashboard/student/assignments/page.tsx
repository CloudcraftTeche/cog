"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  Video,
  File,
  BookOpen,
  Trophy,
  Star,
  Sparkles,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  CheckCircle,
  Play,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/assignment/`);
      setAssignments(response.data.data);
    } catch (err) {
      setError("Failed to load assignments");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: any) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);

    if (assignment.submitted) return "submitted";
    if (now < startDate) return "locked";
    if (now > endDate) return "ended";
    return "active";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          badge: "bg-gradient-to-r from-green-500 to-emerald-600",
          icon: <Play className="h-3 w-3" />,
          text: "Active",
          description: "Ready to start",
          canStart: true,
        };
      case "locked":
        return {
          badge: "bg-gradient-to-r from-gray-500 to-slate-600",
          icon: <Lock className="h-3 w-3" />,
          text: "Locked",
          description: "Not yet available",
          canStart: false,
        };
      case "ended":
        return {
          badge: "bg-gradient-to-r from-red-500 to-rose-600",
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Ended",
          description: "Deadline passed",
          canStart: false,
        };
      case "submitted":
        return {
          badge: "bg-gradient-to-r from-blue-500 to-indigo-600",
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Submitted",
          description: "Assignment completed",
          canStart: false,
        };
      default:
        return {
          badge: "bg-gradient-to-r from-gray-500 to-slate-600",
          icon: <Clock className="h-3 w-3" />,
          text: "Unknown",
          description: "Status unknown",
          canStart: false,
        };
    }
  };

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = assignments.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />;
      case "pdf":
        return <File className="h-4 w-4 text-pink-600" />;
      default:
        return <FileText className="h-4 w-4 text-green-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500 mx-auto mb-6"></div>
                <BookOpen className="h-8 w-8 text-blue-500 absolute top-4 left-4 animate-pulse" />
              </div>
              <div className="gradient-bg rounded-2xl p-4 sm:p-6 text-white animate-float">
                <p className="text-base sm:text-lg font-medium">
                  Loading your amazing assignments...
                </p>
                <div className="flex justify-center mt-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <div className="gradient-bg rounded-full w-20 sm:w-32 h-20 sm:h-32 flex items-center justify-center mx-auto mb-6 animate-float">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md mx-auto">
              <p className="text-red-700 mb-4 text-base sm:text-lg font-medium">
                {error}
              </p>
              <Button
                onClick={fetchAssignments}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="mb-6 text-center">
          <div className="gradient-bg rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden animate-float">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
            <div className="relative z-10 ">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                <Sparkles className="h-6 sm:h-7 w-6 sm:w-7 animate-pulse" />
                <h1 className="text-2xl sm:text-4xl font-bold font-serif">
                  Assignments
                </h1>
                <Sparkles className="h-6 sm:h-7 w-6 sm:w-7 animate-pulse" />
              </div>
              <p className="text-white/90 text-sm sm:text-lg mb-4">
                Discover, learn, and excel in your academic journey ✨
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">
                    {assignments?.length} Total Assignments
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Keep Learning!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentAssignments.map((assignment, index) => {
            const status = getAssignmentStatus(assignment);
            const statusConfig = getStatusConfig(status);

            return (
              <Card key={assignment._id} className="relative group">
                <div className="relative bg-white rounded-xl m-0.5">
                  <CardHeader className="pb-3 relative">
                    <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8 opacity-40"></div>
                    <div className="flex items-start justify-between relative z-10 flex-col sm:flex-row gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 group-hover:scale-110 transition-transform duration-300">
                          {getContentIcon(assignment.contentType)}
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg font-serif text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">
                            {assignment.title}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600 font-medium">
                              Assignment #{startIndex + index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 self-start sm:self-center">
                        <Badge
                          className={`capitalize font-semibold px-2 py-1 rounded-full text-white shadow-md text-xs ${
                            assignment.contentType === "video"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : assignment.contentType === "pdf"
                              ? "bg-gradient-to-r from-pink-500 to-pink-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                        >
                          {assignment.contentType}
                        </Badge>
                        <Badge
                          className={`flex items-center gap-1 font-semibold px-2 py-1 rounded-full text-white shadow-md text-xs ${statusConfig.badge}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.text}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 text-gray-700 text-xs sm:text-sm leading-relaxed mt-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div
                        className={`flex items-center gap-2 text-xs rounded-lg p-2 sm:p-3 border-2 ${
                          status === "active"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            : status === "locked"
                            ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                            : status === "ended"
                            ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-md ${
                            status === "active"
                              ? "bg-green-500"
                              : status === "locked"
                              ? "bg-gray-500"
                              : status === "ended"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {statusConfig.icon}
                        </div>
                        <div>
                          <span
                            className={`font-semibold ${
                              status === "active"
                                ? "text-green-800"
                                : status === "locked"
                                ? "text-gray-800"
                                : status === "ended"
                                ? "text-red-800"
                                : "text-blue-800"
                            }`}
                          >
                            Status
                          </span>
                          <p className="text-gray-800 font-medium">
                            {statusConfig.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200">
                          <div className="p-1.5 bg-blue-500 rounded-md">
                            <Calendar className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-blue-800">
                              Due Date
                            </span>
                            <p className="text-gray-800 font-medium">
                              {formatDate(assignment.endDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2 sm:p-3 border border-green-200">
                          <div className="p-1.5 bg-green-500 rounded-md">
                            <FileText className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-green-800">
                              Questions
                            </span>
                            <p className="text-gray-800 font-medium">
                              {assignment.questions.length} questions
                            </p>
                          </div>
                        </div>
                      </div>

                      {statusConfig.canStart ? (
                        <Link
                          href={`/dashboard/student/assignments/${assignment?._id}`}
                          className="block"
                        >
                          <Button className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-2 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                            <Play className="h-4 w-4 mr-2" />
                            Start Assignment
                            <Sparkles className="h-3 w-3 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 font-bold py-2 sm:py-3 rounded-lg cursor-not-allowed"
                        >
                          {statusConfig.icon}
                          <span className="ml-2">{statusConfig.text}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8">
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    onClick={() => goToPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md"
                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="gradient-bg rounded-full w-24 sm:w-32 h-24 sm:h-32 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-float">
              <BookOpen className="h-12 sm:h-16 w-12 sm:w-16 text-white" />
            </div>
            <div className="bg-gradient-to-r from-blue-50 via-pink-50 to-green-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-xl sm:max-w-2xl mx-auto border-2 border-gray-100">
              <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 font-serif text-gray-800">
                No assignments yet
              </h3>
              <p className="text-gray-700 text-base sm:text-xl leading-relaxed">
                Your amazing learning journey is about to begin! ✨<br />
                Check back soon for exciting new assignments from your teachers.
              </p>
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-pink-100 rounded-full px-4 sm:px-6 py-2 sm:py-3">
                  <Star className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                  <span className="text-gray-800 font-medium text-sm sm:text-base">
                    Stay tuned for updates!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
