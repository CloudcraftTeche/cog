"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  FileText,
  File,
  Clock,
  Calendar,
  Users,
  ChevronRight,
  CheckCircle2,
  Lock,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { IAssignment, UserRole } from "@/types/assignment.types";
import { 
  getGradeName, 
  formatDate, 
  getTimeRemaining, 
  getTimeProgress,
  getAssignmentStatus 
} from "@/utils/assignmentHelpers";
interface AssignmentCardProps {
  assignment: IAssignment;
  userRole?: UserRole;
  isSubmitted?: boolean;
}
export function AssignmentCard({ 
  assignment, 
  userRole = "student", 
  isSubmitted = false 
}: AssignmentCardProps) {
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  const { isUpcoming, isActive, isEnded, isLocked } = getAssignmentStatus(assignment);
  const contentTypeConfig = {
    video: {
      icon: Video,
      label: "Video",
      colors: "bg-blue-100 text-blue-700 border-blue-200",
      accent: "bg-blue-600"
    },
    text: {
      icon: FileText,
      label: "Text",
      colors: "bg-green-100 text-green-700 border-green-200",
      accent: "bg-green-600"
    },
    pdf: {
      icon: File,
      label: "PDF",
      colors: "bg-purple-100 text-purple-700 border-purple-200",
      accent: "bg-purple-600"
    },
  }[assignment.contentType];
  const ContentTypeIcon = contentTypeConfig.icon;
  const gradeName = getGradeName(assignment);
  const getStatusBadge = () => {
    if (isSubmitted && userRole === "student") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 shadow-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    }
    if (isLocked) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }
    if (isEnded) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 shadow-sm">
          <AlertCircle className="w-3 h-3 mr-1" />
          Ended
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm">
          <Clock className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-700 mr-1.5 animate-pulse" />
        Active
      </Badge>
    );
  };
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 bg-white border-gray-200">
      <div className={`absolute top-0 left-0 w-full h-1 ${contentTypeConfig.accent}`} />
      <div className="absolute top-1 left-0 w-full h-0.5 bg-gray-100">
        <div
          className={`h-full transition-all ${
            isEnded ? "bg-red-500" : isActive && getTimeProgress(startDate, endDate) > 75 ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ width: `${getTimeProgress(startDate, endDate)}%` }}
        />
      </div>
      <CardHeader className="pt-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-3 rounded-xl border shadow-sm ${contentTypeConfig.colors}`}>
              <ContentTypeIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {assignment.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span className={`font-medium px-2 py-0.5 rounded-full ${contentTypeConfig.colors}`}>
                  {contentTypeConfig.label}
                </span>
                {gradeName && (
                  <>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="hidden sm:inline">{gradeName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Due {formatDate(endDate)}</span>
          </div>
          {assignment.questions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-green-600" />
              <span>{assignment.questions.length} questions</span>
            </div>
          )}
          {(userRole === "teacher" || userRole === "admin") && assignment.submittedStudents && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>{assignment.submittedStudents.length} submitted</span>
            </div>
          )}
          {assignment.totalMarks && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900">{assignment.totalMarks} marks</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock
              className={`w-3.5 h-3.5 shrink-0 ${
                isEnded
                  ? "text-red-600"
                  : isActive && getTimeProgress(startDate, endDate) > 75
                    ? "text-amber-600"
                    : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs font-medium truncate ${
                isEnded
                  ? "text-red-600"
                  : isActive && getTimeProgress(startDate, endDate) > 75
                    ? "text-amber-600"
                    : "text-gray-500"
              }`}
            >
              {getTimeRemaining(startDate, endDate, assignment.status)}
            </span>
          </div>
          <Button variant="default" size="sm" className="shrink-0 shadow-sm" asChild>
            <Link href={`/dashboard/student/assignments/${assignment._id}`}>
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
