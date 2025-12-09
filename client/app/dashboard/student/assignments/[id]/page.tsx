"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { IAssignment, ISubmission } from "@/types/assignment.types";
import { AssignmentDetail } from "@/components/student/assignments/AssignmentDetail";
export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        api
          .get("/assignments/my/submissions/all")
          .catch(() => ({ data: { success: false, data: [] } })),
      ]);
      if (assignmentRes.data.success) {
        setAssignment(assignmentRes.data.data);
      } else {
        setError("Assignment not found");
        return;
      }
      if (
        submissionsRes.data?.success &&
        Array.isArray(submissionsRes.data.data)
      ) {
        const mySubmission = submissionsRes.data.data.find((s: ISubmission) => {
          const assignmentId =
            typeof s.assignmentId === "object"
              ? s.assignmentId._id
              : s.assignmentId;
          return assignmentId === id;
        });
        if (mySubmission) {
          setSubmission(mySubmission);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);
  const gradeId = assignment
    ? typeof assignment.gradeId === "object"
      ? assignment.gradeId._id
      : assignment.gradeId
    : undefined;
  if (loading) {
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
  if (error || !assignment) {
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
            The assignment you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
              </Link>
            </Button>
            <Button onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
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
