"use client";
import {
  ISubmission,
  LoadingState,
  NoSearchResultsState,
  NoSubmissionsState,
  SubmissionCard,
  SubmissionHeader,
} from "@/components/admin/assignments/SubmissionsComponents";
import { Pagination } from "@/components/admin/teachers/Pagination";
import { useTeacherSubmissions } from "@/hooks/useTeacherSubmissions";
import { useParams } from "next/navigation";

export default function TeacherSubmissionsPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const {
    submissions,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    gradeSubmission,
  } = useTeacherSubmissions({ assignmentId, limit: 10 });

  if (submissions.length === 0 && !loading && searchTerm.trim() === "") {
    return <NoSubmissionsState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <SubmissionHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {loading ? (
          <LoadingState />
        ) : submissions.length > 0 ? (
          <>
            <div className="space-y-3 sm:space-y-4">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission as ISubmission}
                  onGradeSubmission={gradeSubmission}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <NoSearchResultsState />
        )}
      </div>
    </div>
  );
}
