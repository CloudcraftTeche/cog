// components/admin/chapters/SubmissionsList.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Video,
  FileText,
  MessageSquare,
  Download,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import { StudentSubmission, Submission } from "@/types/admin/chapter.types";
import { formatDateForDisplay } from "@/utils/admin/chapter.utils";

interface SubmissionsListProps {
  submissions: StudentSubmission[];
}

const getSubmissionIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-5 w-5" />;
    case "pdf":
      return <FileText className="h-5 w-5" />;
    case "text":
      return <MessageSquare className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
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

interface SubmissionCardProps {
  submission: Submission;
  index: number;
}

function SubmissionCard({ submission, index }: SubmissionCardProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-5 border border-gray-200">
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
              {formatDateForDisplay(submission.submittedAt.toString())}
            </p>
          </div>
        </div>
      </div>

      {submission.type === "text" && submission.content && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
        </div>
      )}

      {(submission.type === "video" || submission.type === "pdf") &&
        submission.fileUrl && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(submission.fileUrl, "_blank")}
              className="bg-white hover:bg-gray-50 border-gray-300"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View {submission.type === "video" ? "Video" : "PDF"}
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
  );
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
  return (
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
              {studentSubmission.submissions.map((submission, subIndex) => (
                <SubmissionCard
                  key={subIndex}
                  submission={submission}
                  index={subIndex}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}