"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Trophy,
  Target,
  BookOpen,
  Video,
  File,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IAssignment, ISubmission } from "@/types/assignment.types";
import { SubmissionContent, SubmissionForm } from "./SubmissionForm";
import { ContentViewer } from "./Contentviewer";
import { QuestionForm } from "./QuestionForm";
interface AssignmentDetailProps {
  assignment: IAssignment;
  userRole?: "student" | "teacher" | "admin";
  existingSubmission?: ISubmission | null;
  gradeId?: string;
}
export function AssignmentDetail({
  assignment,
  userRole = "student",
  existingSubmission = null,
  gradeId,
}: AssignmentDetailProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (existingSubmission?.answers) {
      const initialAnswers: Record<number, string> = {};
      existingSubmission.answers.forEach((a, i) => {
        initialAnswers[i] = a.answer;
      });
      return initialAnswers;
    }
    return {};
  });
  const [submissionContent, setSubmissionContent] = useState<SubmissionContent>(
    () => {
      if (existingSubmission) {
        return {
          type: existingSubmission.submissionType,
          textContent: existingSubmission.textContent,
        };
      }
      return { type: "text", textContent: "" };
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingSubmission);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  const isActive =
    now >= startDate && now <= endDate && assignment.status === "active";
  const isEnded = now > endDate || assignment.status === "ended";
  const canSubmit = isActive && !submitted && userRole === "student";
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };
  const isSubmissionContentValid = () => {
    switch (submissionContent.type) {
      case "text":
        return !!submissionContent.textContent?.trim();
      case "video":
        return !!submissionContent.videoFile;
      case "pdf":
        return !!submissionContent.pdfFile;
      default:
        return false;
    }
  };
  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!isSubmissionContentValid()) {
      setSubmitError(
        "Please provide your submission content (text, video, or PDF)"
      );
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answersPayload = assignment.questions.map((q, i) => ({
        question: q,
        answer: answers[i] || "",
      }));
      const submissionGradeId =
        gradeId ||
        (typeof assignment.gradeId === "object"
          ? assignment.gradeId._id
          : assignment.gradeId);
      const formData = new FormData();
      formData.append("assignmentId", assignment._id);
      formData.append("gradeId", submissionGradeId || "");
      formData.append("submissionType", submissionContent.type);
      formData.append("answers", JSON.stringify(answersPayload));
      if (submissionContent.type === "text") {
        formData.append("textContent", submissionContent.textContent || "");
      } else if (
        submissionContent.type === "video" &&
        submissionContent.videoFile
      ) {
        formData.append("file", submissionContent.videoFile);
      } else if (
        submissionContent.type === "pdf" &&
        submissionContent.pdfFile
      ) {
        formData.append("file", submissionContent.pdfFile);
      }
      const response = await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const allQuestionsAnswered =
    assignment.questions.length === 0 ||
    Object.keys(answers).length === assignment.questions.length;
  const canSubmitNow = allQuestionsAnswered && isSubmissionContentValid();
  const gradeName =
    typeof assignment.gradeId === "object" ? assignment.gradeId.grade : "";
  const contentTypeConfig = {
    video: {
      icon: Video,
      gradient: "from-primary to-info",
      bg: "bg-primary/10",
      text: "text-primary",
    },
    text: {
      icon: FileText,
      gradient: "from-success to-primary",
      bg: "bg-success/10",
      text: "text-success",
    },
    pdf: {
      icon: File,
      gradient: "from-destructive to-warning",
      bg: "bg-destructive/10",
      text: "text-destructive",
    },
  }[assignment.contentType];
  const ContentIcon = contentTypeConfig.icon;
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-8">
      {}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-info p-6 sm:p-8 text-primary-foreground">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 -ml-2"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div
              className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg shrink-0`}
            >
              <ContentIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {assignment.title}
                </h1>
                {submitted && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Submitted
                  </Badge>
                )}
                {isEnded && !submitted && (
                  <Badge className="bg-destructive/80 text-white border-0">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    Missed
                  </Badge>
                )}
                {!isEnded && !submitted && isActive && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                {assignment.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  Start
                </p>
                <p className="text-sm font-bold truncate text-foreground">
                  {formatDate(startDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:shadow-lg hover:shadow-destructive/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-warning text-white shadow-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Due</p>
                <p className="text-sm font-bold truncate text-foreground">
                  {formatDate(endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:shadow-lg hover:shadow-success/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-success to-primary text-white shadow-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  Questions
                </p>
                <p className="text-sm font-bold text-foreground">
                  {assignment.questions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 hover:shadow-lg hover:shadow-warning/10 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-destructive text-white shadow-lg">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  Total Marks
                </p>
                <p className="text-sm font-bold text-foreground">
                  {assignment.totalMarks || 100}
                  {assignment.passingMarks && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (Pass: {assignment.passingMarks})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {}
      {submitted && existingSubmission?.score !== undefined && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-success/5 to-warning/10 border-primary/30 shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-success/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-warning to-warning/70 text-white shadow-xl">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Your Score
                  </p>
                  <p className="text-5xl font-black text-foreground">
                    {existingSubmission.score}
                    <span className="text-2xl font-normal text-muted-foreground">
                      /{assignment.totalMarks || 100}
                    </span>
                  </p>
                </div>
              </div>
              {existingSubmission.score >= (assignment.passingMarks || 40) ? (
                <Badge className="bg-gradient-to-r from-success to-primary text-white text-base px-5 py-2 border-0 shadow-lg">
                  <Star className="w-5 h-5 mr-2" />
                  Passed
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-destructive to-warning text-white text-base px-5 py-2 border-0 shadow-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Keep Trying
                </Badge>
              )}
            </div>
            {existingSubmission.feedback && (
              <div className="mt-6 p-5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Teacher Feedback
                </p>
                <p className="text-sm text-muted-foreground">
                  {existingSubmission.feedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {}
      <Card className="shadow-lg border-border/50 overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="text-lg flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${contentTypeConfig.gradient} text-white shadow-md`}
            >
              <ContentIcon className="w-5 h-5" />
            </div>
            Assignment Content
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ContentViewer assignment={assignment} />
        </CardContent>
      </Card>
      {}
      {assignment.questions.length > 0 && (
        <Card className="shadow-lg border-border/50 overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-success/10 to-transparent">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-success to-primary text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              Questions ({assignment.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm
              questions={assignment.questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              disabled={!canSubmit}
              showResults={submitted && existingSubmission !== null}
            />
          </CardContent>
        </Card>
      )}
      {}
      {userRole === "student" && (
        <SubmissionForm
          value={submissionContent}
          onChange={setSubmissionContent}
          disabled={!canSubmit}
          existingSubmission={
            existingSubmission
              ? {
                  submissionType: existingSubmission.submissionType,
                  textContent: existingSubmission.textContent,
                  videoUrl: existingSubmission.videoUrl,
                  pdfUrl: existingSubmission.pdfUrl,
                }
              : null
          }
        />
      )}
      {}
      {submitError && (
        <div className="p-5 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-medium">
          {submitError}
        </div>
      )}
      {}
      {userRole === "student" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none sm:p-0">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {!submitted ? (
                canSubmitNow ? (
                  <span className="text-success flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Ready to submit
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    {!allQuestionsAnswered &&
                      `${Object.keys(answers).length}/${assignment.questions.length} questions • `}
                    {!isSubmissionContentValid() &&
                      "Add your submission content"}
                  </span>
                )
              ) : (
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Submitted
                  {existingSubmission?.submittedAt &&
                    ` on ${new Date(existingSubmission.submittedAt).toLocaleDateString()}`}
                </span>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!canSubmit || !canSubmitNow || isSubmitting}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-info hover:opacity-90 text-white shadow-xl shadow-primary/30 border-0 h-12 px-8 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 sm:mx-0 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">
                    Submit Assignment?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit this assignment? You
                    won&apos;t be able to change your answers after submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    className="rounded-xl bg-gradient-to-r from-primary to-info"
                  >
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}
