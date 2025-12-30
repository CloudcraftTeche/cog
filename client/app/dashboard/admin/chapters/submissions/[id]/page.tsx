"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileCheck,
  Video,
  FileText,
  MessageSquare,
  Download,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
interface Submission {
  type: "text" | "video" | "pdf";
  content?: string;
  fileUrl?: string;
  filePublicId?: string;
  submittedAt: Date;
  _id?: string;
}
interface StudentSubmission {
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNumber: string;
    profilePictureUrl?: string;
    gradeId?: {
      _id: string;
      grade: string;
    };
  };
  status: string;
  score?: number;
  completedAt?: Date;
  startedAt?: Date;
  submissions: Submission[];
}
interface ChapterData {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  gradeId: {
    _id: string;
    grade: string;
  };
  questions: any[];
}
export default function ChapterSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params?.id as string;
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    if (!chapterId) return;
    try {
      setLoading(true);
      const chapterResponse = await api.get(`/chapters/${chapterId}`);
      const chapterData = chapterResponse.data.data;
      setChapter(chapterData);
      const studentSubmissions: StudentSubmission[] = [];
      if (
        chapterData.studentProgress &&
        chapterData.studentProgress.length > 0
      ) {
        for (const progress of chapterData.studentProgress) {
          if (progress.submissions && progress.submissions.length > 0) {
            studentSubmissions.push({
              studentId: progress.studentId,
              status: progress.status,
              score: progress.score,
              completedAt: progress.completedAt,
              startedAt: progress.startedAt,
              submissions: progress.submissions,
            });
          }
        }
      }
      setSubmissions(studentSubmissions);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch submissions"
      );
    } finally {
      setLoading(false);
    }
  }, [chapterId]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const getSubmissionIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "text":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileCheck className="h-5 w-5" />;
    }
  };
  const getSubmissionColor = (type: string) => {
    switch (type) {
      case "video":
        return "from-red-100 to-pink-100 text-red-700 border-red-200";
      case "pdf":
        return "from-orange-100 to-red-100 text-orange-700 border-orange-200";
      case "text":
        return "from-blue-100 to-indigo-100 text-blue-700 border-blue-200";
      default:
        return "from-gray-100 to-slate-100 text-gray-700 border-gray-200";
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
        <Card className="w-full max-w-md mx-4 shadow-2xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">Unable to load chapter data</p>
            <Button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Chapters
          </Button>
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileCheck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{chapter.title}</h1>
                <p className="text-purple-100 text-lg mt-1">
                  Student Submissions
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                🎓 Grade {chapter.gradeId.grade}
              </Badge>
              <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                📖 Chapter {chapter.chapterNumber}
              </Badge>
              <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                📝 {submissions.length} Submissions
              </Badge>
            </div>
          </div>
        </div>
        {}
        {submissions.length === 0 ? (
          <Card className="shadow-xl rounded-3xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Students haven't submitted their work for this chapter yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((studentSubmission, index) => (
              <Card
                key={index}
                className="shadow-xl rounded-3xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage
                          src={studentSubmission.studentId.profilePictureUrl}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {studentSubmission.studentId.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {studentSubmission.studentId.name}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {studentSubmission.studentId.rollNumber}
                          </span>
                          {studentSubmission.studentId.gradeId && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Grade {studentSubmission.studentId.gradeId.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {studentSubmission.score !== undefined && (
                        <div className="text-2xl font-bold text-purple-600">
                          {studentSubmission.score}%
                        </div>
                      )}
                      <Badge
                        className={`mt-1 ${
                          studentSubmission.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {studentSubmission.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {studentSubmission.submissions.map(
                      (submission, subIndex) => (
                        <div
                          key={subIndex}
                          className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-5 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${getSubmissionColor(
                                  submission.type
                                )}`}
                              >
                                {getSubmissionIcon(submission.type)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 capitalize">
                                  {submission.type} Submission
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          {submission.type === "text" && submission.content && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {submission.content}
                              </p>
                            </div>
                          )}
                          {(submission.type === "video" ||
                            submission.type === "pdf") &&
                            submission.fileUrl && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(submission.fileUrl, "_blank")
                                  }
                                  className="bg-white hover:bg-gray-50 border-gray-300"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View{" "}
                                  {submission.type === "video"
                                    ? "Video"
                                    : "PDF"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = submission.fileUrl!;
                                    link.download = `submission-${submission.type}`;
                                    link.click();
                                  }}
                                  className="bg-white hover:bg-gray-50 border-gray-300"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
