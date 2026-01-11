"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  Sparkles,
  Play,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { IAssignment } from "@/types/assignment.types";
interface AssignmentCardProps {
  assignment: IAssignment;
  userRole?: "student" | "teacher" | "admin";
  isSubmitted?: boolean;
}
export function AssignmentCard({
  assignment,
  userRole = "student",
  isSubmitted = false,
}: AssignmentCardProps) {
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  const isUpcoming = now < startDate;
  const isActive =
    now >= startDate && now <= endDate && assignment.status === "active";
  const isEnded = now > endDate || assignment.status === "ended";
  const isLocked = assignment.status === "locked";
  const getTimeRemaining = () => {
    if (isEnded) return "Ended";
    if (isUpcoming) return `Starts ${formatDate(startDate)}`;
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "Due soon!";
  };
  const getTimeProgress = () => {
    if (isUpcoming) return 0;
    if (isEnded) return 100;
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const contentTypeConfig = {
    video: {
      icon: Video,
      label: "Video",
      gradient: "from-primary to-info",
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      iconBg: "bg-gradient-to-br from-primary to-info",
    },
    text: {
      icon: FileText,
      label: "Text",
      gradient: "from-success to-primary",
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
      iconBg: "bg-gradient-to-br from-success to-primary",
    },
    pdf: {
      icon: File,
      label: "PDF",
      gradient: "from-destructive to-warning",
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/20",
      iconBg: "bg-gradient-to-br from-destructive to-warning",
    },
  }[assignment.contentType];
  const ContentTypeIcon = contentTypeConfig.icon;
  const getStatusBadge = () => {
    if (isSubmitted && userRole === "student") {
      return (
        <Badge className="bg-gradient-to-r from-success to-primary text-success-foreground border-0 shadow-lg shadow-success/20 px-3">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          Submitted
        </Badge>
      );
    }
    if (isLocked) {
      return (
        <Badge
          variant="secondary"
          className="bg-muted/80 text-muted-foreground border-0"
        >
          <Lock className="w-3.5 h-3.5 mr-1.5" />
          Locked
        </Badge>
      );
    }
    if (isEnded && !isSubmitted && userRole === "student") {
      return (
        <Badge className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-lg shadow-destructive/20 px-3">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          Missed
        </Badge>
      );
    }
    if (isEnded) {
      return (
        <Badge className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-lg shadow-destructive/20 px-3">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          Ended
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground border-0 shadow-lg shadow-warning/20 px-3">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Upcoming
        </Badge>
      );
    }
    if (!isSubmitted && isActive && userRole === "student") {
      return (
        <Badge className="bg-gradient-to-r from-warning to-orange-500 text-white border-0 shadow-lg shadow-warning/20 px-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-primary to-info text-primary-foreground border-0 shadow-lg shadow-primary/20 px-3">
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        Active
      </Badge>
    );
  };
  const gradeName =
    typeof assignment.gradeId === "object" ? assignment.gradeId.grade : "";
  const getButtonContent = () => {
    if (isSubmitted && userRole === "student") {
      if (isActive) {
        return {
          icon: <Edit className="w-4 h-4 mr-1.5 sm:mr-2" />,
          text: "Edit",
          shortText: "Edit",
          gradient: "from-warning to-orange-500",
        };
      }
      return {
        icon: <Eye className="w-4 h-4 mr-1.5 sm:mr-2" />,
        text: "View",
        shortText: "View",
        gradient: "from-info to-primary",
      };
    }
    return {
      icon: <Play className="w-4 h-4 mr-1.5 sm:mr-2" />,
      text: "Start",
      shortText: "Go",
      gradient: contentTypeConfig.gradient,
    };
  };
  const buttonContent = getButtonContent();
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card via-card to-muted/30 border-border/50 ${
        isSubmitted && userRole === "student"
          ? "hover:shadow-success/10 ring-2 ring-success/20"
          : "hover:shadow-primary/10"
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${
          isSubmitted && userRole === "student"
            ? "from-success to-primary"
            : contentTypeConfig.gradient
        }`}
      />
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${
          isSubmitted && userRole === "student"
            ? "from-success to-primary"
            : contentTypeConfig.gradient
        } opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
      />
      {}
      {isSubmitted && userRole === "student" && (
        <div className="absolute top-4 right-4 p-2 rounded-full bg-success/20 backdrop-blur-sm">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
      )}
      {}
      <div className="absolute top-1.5 left-0 w-full h-0.5 bg-muted/50">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isSubmitted && userRole === "student"
              ? "bg-gradient-to-r from-success to-primary"
              : isEnded
                ? "bg-destructive"
                : isActive && getTimeProgress() > 75
                  ? "bg-gradient-to-r from-warning to-destructive"
                  : `bg-gradient-to-r ${contentTypeConfig.gradient}`
          }`}
          style={{
            width: `${isSubmitted && userRole === "student" ? 100 : getTimeProgress()}%`,
          }}
        />
      </div>
      <CardHeader className="pt-8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={`p-3 rounded-2xl ${
                isSubmitted && userRole === "student"
                  ? "bg-gradient-to-br from-success to-primary"
                  : contentTypeConfig.iconBg
              } text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
            >
              <ContentTypeIcon className="w-6 h-6" />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h3 className="font-bold text-lg text-card-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {assignment.title}
              </h3>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span
                  className={`font-semibold px-2.5 py-1 rounded-full ${
                    isSubmitted && userRole === "student"
                      ? "bg-success/10 text-success"
                      : `${contentTypeConfig.bg} ${contentTypeConfig.text}`
                  }`}
                >
                  {contentTypeConfig.label}
                </span>
                {gradeName && (
                  <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    Grade {gradeName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isEnded && !isSubmitted && userRole === "student"
                ? "bg-destructive/20 text-destructive font-semibold"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">Due {formatDate(endDate)}</span>
          </div>
          {assignment.questions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">
                {assignment.questions.length} questions
              </span>
            </div>
          )}
          {(userRole === "teacher" || userRole === "admin") &&
            assignment.submittedStudents && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-info/10 text-info">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {assignment.submittedStudents.length} submitted
                </span>
              </div>
            )}
          {assignment.totalMarks && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning-foreground">
              <span className="font-bold">{assignment.totalMarks} pts</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-1.5 rounded-full ${
                isSubmitted && userRole === "student"
                  ? "bg-success/10"
                  : isEnded
                    ? "bg-destructive/10"
                    : isActive && getTimeProgress() > 75
                      ? "bg-warning/10"
                      : "bg-muted"
              }`}
            >
              {isSubmitted && userRole === "student" ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Clock
                  className={`w-4 h-4 ${
                    isEnded
                      ? "text-destructive"
                      : isActive && getTimeProgress() > 75
                        ? "text-warning"
                        : "text-muted-foreground"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-sm font-semibold truncate ${
                isSubmitted && userRole === "student"
                  ? "text-success"
                  : isEnded
                    ? "text-destructive"
                    : isActive && getTimeProgress() > 75
                      ? "text-warning"
                      : "text-muted-foreground"
              }`}
            >
              {isSubmitted && userRole === "student"
                ? "Completed"
                : getTimeRemaining()}
            </span>
          </div>
          <Button
            className={`shrink-0 bg-gradient-to-r ${buttonContent.gradient} hover:opacity-90 text-white shadow-lg shadow-primary/20 border-0 transition-all duration-300 group-hover:shadow-xl ${
              isSubmitted && userRole === "student"
                ? "group-hover:shadow-success/30"
                : "group-hover:shadow-primary/30"
            }`}
            size="sm"
            asChild
          >
            <Link href={`/dashboard/student/assignments/${assignment._id}`}>
              {buttonContent.icon}
              <span className="hidden sm:inline">{buttonContent.text}</span>
              <span className="sm:hidden">{buttonContent.shortText}</span>
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
