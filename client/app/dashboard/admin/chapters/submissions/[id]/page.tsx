// app/dashboard/admin/chapters/submissions/[id]/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChapterSubmissions } from "@/hooks/admin/useChapter";
import { LoadingState } from "@/components/shared/LoadingComponent";
import { ChapterHeader, EmptySubmissions, ErrorDisplay } from "@/components/admin/chapters/SharedComponents";
import SubmissionsList from "@/components/admin/chapters/SubmissionsList";

export default function ChapterSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params?.id as string;

  const { data, isLoading, error } = useChapterSubmissions(chapterId);

  if (isLoading) {
    return <LoadingState text="submissions" />;
  }

  if (error || !data) {
    return (
      <ErrorDisplay
        title="Failed to Load Submissions"
        message="Unable to load chapter submissions"
        onRetry={() => router.back()}
      />
    );
  }

  const { chapter, submissions } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-white/50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Chapters
        </Button>

        <ChapterHeader
          title={chapter.title}
          description={chapter.description}
          gradeNumber={chapter.gradeId.grade}
          chapterNumber={chapter.chapterNumber}
          questionsCount={chapter.questions?.length || 0}
          submissionsCount={submissions.length}
          variant="submissions"
        />

        {submissions.length === 0 ? (
          <EmptySubmissions />
        ) : (
          <SubmissionsList submissions={submissions} />
        )}
      </div>
    </div>
  );
}