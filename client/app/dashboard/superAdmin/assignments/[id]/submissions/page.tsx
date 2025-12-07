"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MessageSquare,
  FileText,
  Video,
  FileImage,
  Search,
  Users,
  ChevronDown,
  ChevronRight,
  Download,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

interface Question {
  _id: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface Submission {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    questions: Question[];
  };
  student: {
    _id: string;
    name: string;
    email: string;
    profilePictureUrl: string;
  };
  submissionType: "text" | "video" | "pdf";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  answers: Answer[];
  score?: number;
  feedback?: string;
  submitted: boolean;
  createdAt: string;
}

export default function AdminSubmissions() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(
    null
  );
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(
    null
  );
  const [tempScore, setTempScore] = useState("");
  const [tempFeedback, setTempFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchSubmissions = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await api.get(`/assignment/${id}/submissions`, {
        params: {
          page,
          limit: LIMIT,
          search,
        },
      });

      setSubmissions(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchSubmissions(currentPage, searchTerm);
  }, [currentPage, searchTerm,fetchSubmissions]);

  const handleGradeSubmission = async (
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    try {
      await api.put(`/submission/${submissionId}/score`, {
        score,
        feedback,
      });

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId ? { ...sub, score, feedback } : sub
        )
      );
      setGradingSubmission(null);
      setTempScore("");
      setTempFeedback("");

      fetchSubmissions(currentPage, searchTerm);
    } catch (error) {
      console.error("Error grading submission:", error);
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId ? { ...sub, score, feedback } : sub
        )
      );
      setGradingSubmission(null);
      setTempScore("");
      setTempFeedback("");
    }
  };

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission._id);
    setTempScore(submission.score?.toString() || "");
    setTempFeedback(submission.feedback || "");
  };

  const toggleExpanded = (submissionId: string) => {
    setExpandedSubmission(
      expandedSubmission === submissionId ? null : submissionId
    );
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "pdf":
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pdf":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-gray-400";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score?: number) => {
    if (score === undefined || score === null)
      return "bg-gray-100 text-gray-600";
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const renderPageButtons = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === currentPage ? "default" : "outline"}
            onClick={() => goToPage(p)}
            className="text-xs px-3 py-1"
          >
            {p}
          </Button>
        ))}
      </div>
    );
  };

  if (submissions.length === 0 && !loading && searchTerm.trim() === "") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">
            No submissions yet
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg">
            Students will see their assignments here once they start
            submitting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Student Submissions
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">
                Review and grade student work
              </p>
            </div>
          </div>

          <div className="w-full max-w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="Search students or assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-200 h-10 sm:h-12 text-sm sm:text-base shadow-sm w-full"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base sm:text-lg">
                Loading submissions...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {submissions?.map((submission) => {
                return (
                  <Card
                    key={submission._id}
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-lg sm:rounded-xl"
                  >
                    <CardHeader className="p-3 sm:p-4 lg:p-5 border-b bg-gradient-to-r">
                      <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 sm:border-3 border-white shadow-md flex-shrink-0">
                            <AvatarImage
                              src={submission.student?.profilePictureUrl || ""}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm sm:text-base">
                              {submission.student?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg sm:text-xl text-gray-800 font-semibold truncate">
                              {submission.student?.name}
                            </CardTitle>
                            <p className="text-gray-600 font-medium truncate text-sm sm:text-base">
                              {submission.assignment?.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {submission.student?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge
                            className={`${getSubmissionTypeColor(
                              submission.submissionType
                            )} border font-medium text-xs sm:text-sm flex items-center gap-1`}
                          >
                            {getSubmissionTypeIcon(submission.submissionType)}
                            <span className="capitalize">
                              {submission.submissionType}
                            </span>
                          </Badge>

                          {submission.score !== undefined &&
                            submission.score !== null && (
                              <Badge
                                className={`${getScoreBadgeColor(
                                  submission.score
                                )} border font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 flex items-center gap-1`}
                              >
                                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                                {submission.score}
                              </Badge>
                            )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(submission?._id)}
                            className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg ml-auto"
                          >
                            {expandedSubmission === submission._id ? (
                              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedSubmission === submission._id && (
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            {getSubmissionTypeIcon(submission.submissionType)}
                            Submission Content
                          </h4>

                          {submission.submissionType === "text" &&
                            submission.textContent && (
                              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                  {submission.textContent.length > 150
                                    ? `${submission.textContent.substring(
                                        0,
                                        150
                                      )}...`
                                    : submission.textContent}
                                </p>
                              </div>
                            )}

                          {submission.submissionType === "video" &&
                            submission.videoUrl && (
                              <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-purple-700">
                                    <Video className="h-4 w-4" />
                                    <span className="font-medium text-xs sm:text-sm">
                                      Video Submission
                                    </span>
                                  </div>

                                  <video
                                    controls
                                    className="w-full rounded-lg border border-purple-200"
                                  >
                                    <source
                                      src={submission.videoUrl}
                                      type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              </div>
                            )}

                          {submission.submissionType === "pdf" &&
                            submission.pdfUrl && (
                              <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-red-700">
                                    <FileImage className="h-4 w-4" />
                                    <span className="font-medium text-xs sm:text-sm">
                                      PDF Document
                                    </span>
                                  </div>

                                  <iframe
                                    src={submission.pdfUrl}
                                    className="w-full h-64 rounded-lg border border-red-200"
                                  ></iframe>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-transparent w-full sm:w-auto"
                                    onClick={() =>
                                      window.open(submission.pdfUrl, "_blank")
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Open in New Tab
                                  </Button>
                                </div>
                              </div>
                            )}
                        </div>

                        {submission.answers.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
                              Questions & Answers
                            </h4>
                            <div className="space-y-3">
                              {submission.answers.map((answer, index) => {
                                const question =
                                  submission.assignment.questions?.find(
                                    (q) => q._id === answer.questionId
                                  );
                                return (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3 border"
                                  >
                                    <p className="font-medium text-xs sm:text-sm text-gray-800 mb-2">
                                      Q{index + 1}:
                                      {question?.questionText ||
                                        "Question not found"}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600 bg-white rounded p-2 border-l-2 border-indigo-300">
                                      {answer.answer}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {gradingSubmission === submission._id ? (
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-indigo-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-indigo-600" />
                              Grade Submission
                            </h4>
                            <div className="space-y-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Score (0-100)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={tempScore}
                                  onChange={(e) => setTempScore(e.target.value)}
                                  placeholder="Enter score..."
                                  className="bg-white text-sm w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quick Score
                                </label>
                                <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-1 flex-wrap">
                                  {[100, 90, 80, 70, 50, 30, 20, 10, 0].map(
                                    (score) => (
                                      <Button
                                        key={score}
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setTempScore(score.toString())
                                        }
                                        className="hover:bg-indigo-100 text-xs px-2 py-1 h-8"
                                      >
                                        {score}
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Feedback
                              </label>
                              <Textarea
                                value={tempFeedback}
                                onChange={(e) =>
                                  setTempFeedback(e.target.value)
                                }
                                placeholder="Provide constructive feedback..."
                                rows={2}
                                className="bg-white text-sm resize-none"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={() =>
                                  handleGradeSubmission(
                                    submission._id,
                                    Number.parseInt(tempScore || "0"),
                                    tempFeedback
                                  )
                                }
                                disabled={!tempScore}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-xs w-full sm:w-auto"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Save Grade
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setGradingSubmission(null)}
                                className="text-xs w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            {submission.score !== undefined &&
                            submission.score !== null ? (
                              <div className="flex-1 w-full sm:w-auto">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Star
                                    className={`h-4 w-4 ${getScoreColor(
                                      submission.score
                                    )}`}
                                  />
                                  <span
                                    className={`text-lg font-bold ${getScoreColor(
                                      submission.score
                                    )}`}
                                  >
                                    {submission.score}/100
                                  </span>
                                  <Badge
                                    className={`${getScoreBadgeColor(
                                      submission.score
                                    )} text-xs`}
                                  >
                                    {submission.score >= 90
                                      ? "Excellent"
                                      : submission.score >= 80
                                      ? "Good"
                                      : submission.score >= 70
                                      ? "Fair"
                                      : "Needs Improvement"}
                                  </Badge>
                                </div>
                                {submission.feedback && (
                                  <div className="bg-green-50 rounded-lg p-2 border-l-4 border-green-400">
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-green-800 text-xs leading-relaxed">
                                        {submission.feedback}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1 w-full sm:w-auto">
                                <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span className="text-amber-800 font-medium text-sm">
                                      Awaiting Review
                                    </span>
                                  </div>
                                  <p className="text-amber-700 text-xs mt-1">
                                    This submission needs to be graded
                                  </p>
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={() => startGrading(submission)}
                              size="sm"
                              className={`${
                                submission.score !== undefined &&
                                submission.score !== null
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                              } text-xs font-medium w-full sm:w-auto mt-2 sm:mt-0`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {submission.score !== undefined &&
                              submission.score !== null
                                ? "Update Grade"
                                : "Grade Now"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {submissions.length > 0 && (
                <div className="flex flex-col items-center gap-4 mt-6 sm:mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <div className="flex gap-2 order-2 sm:order-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                        className="px-3 sm:px-4"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => goToPage(currentPage + 1)}
                        className="px-3 sm:px-4"
                      >
                        Next
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 order-1 sm:order-2">
                      <p className="text-gray-600 text-xs sm:text-sm font-medium text-center">
                        Page {currentPage} of {totalPages}
                      </p>
                      {totalPages > 1 && (
                        <div className="hidden sm:block">
                          {renderPageButtons()}
                        </div>
                      )}
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="block sm:hidden">
                      <div className="flex flex-wrap justify-center gap-1">
                        {renderPageButtons()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!loading && submissions.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
              No students found
            </h3>
            <p className="text-gray-500 text-sm sm:text-lg">
              Try searching with a different term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
