"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
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
} from "@/components/ui/alert-dialog"
import { IAssignment, ISubmission } from "@/types/assignment.types"
import { QuestionForm } from "./QuestionForm"
import { ContentViewer } from "./Contentviewer"
interface AssignmentDetailProps {
  assignment: IAssignment
  userRole?: "student" | "teacher" | "admin"
  existingSubmission?: ISubmission | null
  gradeId?: string
}
export function AssignmentDetail({
  assignment,
  userRole = "student",
  existingSubmission = null,
  gradeId,
}: AssignmentDetailProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (existingSubmission?.answers) {
      const initialAnswers: Record<number, string> = {}
      existingSubmission.answers.forEach((a, i) => {
        initialAnswers[i] = a.answer
      })
      return initialAnswers
    }
    return {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingSubmission)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const now = new Date()
  const startDate = new Date(assignment.startDate)
  const endDate = new Date(assignment.endDate)
  const isActive = now >= startDate && now <= endDate && assignment.status === "active"
  const isEnded = now > endDate || assignment.status === "ended"
  const canSubmit = isActive && !submitted && userRole === "student"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
  }
  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const answersPayload = assignment.questions.map((q, i) => ({
        question: q,
        answer: answers[i] || "",
      }))
      const submissionGradeId =
        gradeId || (typeof assignment.gradeId === "object" ? assignment.gradeId._id : assignment.gradeId)
      const response = await api.post("/submissions", {
        assignmentId: assignment._id,
        gradeId: submissionGradeId,
        submissionType: "text",
        textContent: "Assignment submission",
        answers: answersPayload,
      })
      if (response.data.success) {
        setSubmitted(true)
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  const allQuestionsAnswered = Object.keys(answers).length === assignment.questions.length
  const contentTypeConfig = {
    video: { icon: Video, color: "text-primary", bg: "bg-primary/10" },
    text: { icon: FileText, color: "text-success", bg: "bg-success/10" },
    pdf: { icon: File, color: "text-chart-4", bg: "bg-chart-4/10" },
  }[assignment.contentType ]
  const ContentIcon = contentTypeConfig.icon
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {}
      <div className="flex items-start gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{assignment.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {submitted && (
                <Badge className="bg-success text-success-foreground shadow-sm shadow-success/25">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Submitted
                </Badge>
              )}
              {isEnded && !submitted && (
                <Badge className="bg-destructive text-destructive-foreground shadow-sm shadow-destructive/25">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Missed
                </Badge>
              )}
              {!isEnded && !submitted && isActive && (
                <Badge className="bg-primary text-primary-foreground shadow-sm shadow-primary/25">Active</Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">{assignment.description}</p>
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-primary/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="text-xs sm:text-sm font-medium truncate">{formatDate(startDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-destructive/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                <Clock className="w-4 h-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Due</p>
                <p className="text-xs sm:text-sm font-medium truncate">{formatDate(endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-success/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-success/10 shrink-0">
                <BookOpen className="w-4 h-4 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-xs sm:text-sm font-medium">{assignment.questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-chart-5/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-chart-5/10 shrink-0">
                <Target className="w-4 h-4 text-chart-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Marks</p>
                <p className="text-xs sm:text-sm font-medium">
                  {assignment.totalMarks || 100}
                  {assignment.passingMarks && (
                    <span className="text-muted-foreground text-xs"> (Pass: {assignment.passingMarks})</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {}
      {submitted && existingSubmission?.score !== undefined && (
        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-success/5 border-primary/30 shadow-lg shadow-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shadow-inner">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">
                    {existingSubmission.score}
                    <span className="text-lg sm:text-xl text-muted-foreground font-normal">
                      /{assignment.totalMarks || 100}
                    </span>
                  </p>
                </div>
              </div>
              {existingSubmission.score >= (assignment.passingMarks || 40) ? (
                <Badge className="bg-success text-success-foreground text-sm sm:text-base px-4 py-1.5 shadow-sm shadow-success/25">
                  Passed
                </Badge>
              ) : (
                <Badge className="bg-destructive text-destructive-foreground text-sm sm:text-base px-4 py-1.5 shadow-sm shadow-destructive/25">
                  Needs Improvement
                </Badge>
              )}
            </div>
            {existingSubmission.feedback && (
              <div className="mt-4 p-4 rounded-lg bg-background/80 border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Feedback</p>
                <p className="text-sm text-muted-foreground">{existingSubmission.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${contentTypeConfig.bg}`}>
              <ContentIcon className={`w-4 h-4 ${contentTypeConfig.color}`} />
            </div>
            Assignment Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentViewer assignment={assignment} />
        </CardContent>
      </Card>
      {}
      {assignment.questions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <BookOpen className="w-4 h-4 text-success" />
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
      {submitError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {submitError}
        </div>
      )}
      {}
      {userRole === "student" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {!submitted ? (
                allQuestionsAnswered ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    All questions answered
                  </span>
                ) : (
                  `${Object.keys(answers).length} of ${assignment.questions.length} answered`
                )
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Submitted{" "}
                  {existingSubmission?.submittedAt &&
                    `on ${new Date(existingSubmission.submittedAt).toLocaleDateString()}`}
                </span>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!canSubmit || !allQuestionsAnswered || isSubmitting}
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                      <span className="sm:hidden ml-1">
                        ({Object.keys(answers).length}/{assignment.questions.length})
                      </span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 sm:mx-0">
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Assignment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit this assignment? You won&apos;t be able to change your answers after
                    submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  )
}
