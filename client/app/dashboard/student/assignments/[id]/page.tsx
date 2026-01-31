// app/dashboard/student/assignments/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AssignmentDetail } from "@/components/student/assignments/AssignmentDetail";
import { useAssignment, useAssignmentSubmission } from "@/hooks/student/use-assignments";

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {error || "Assignment not found"}
        </h3>
        <p className="text-muted-foreground text-center mb-6">
          The assignment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access
          to it.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/student/assignments">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Link>
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Fetch assignment and submission data
  const {
    data: assignmentData,
    isLoading: assignmentLoading,
    error: assignmentError,
    refetch,
  } = useAssignment(id);

  const { submission, isLoading: submissionLoading } = useAssignmentSubmission(id);

  const isLoading = assignmentLoading || submissionLoading;
  const error = assignmentError?.message ?? null;
  const assignment = assignmentData?.data ?? null;

  // Extract gradeId
  const gradeId = assignment
    ? typeof assignment.gradeId === "object"
      ? assignment.gradeId._id
      : assignment.gradeId
    : undefined;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !assignment) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <AssignmentDetail
        assignment={assignment}
        userRole="student"
        existingSubmission={submission}
        gradeId={gradeId}
      />
    </div>
  );
}