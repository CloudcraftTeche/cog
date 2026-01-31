"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";import {
  useDeleteTeacherChapter,
  useGrades,
  useTeacherChapters,
} from "@/hooks/admin/use-teacher-chapters";
import { LoadingState } from "@/components/shared/LoadingComponent";
import {
  TeacherChapterListHeader,
  TeacherChapterSearch,
} from "@/components/admin/teacher-chapters/TeacherChapterListHeader";
import { TeacherChapterGroups } from "@/components/admin/teacher-chapters/TeacherChapterGroups";
const ITEMS_PER_PAGE = 100;
export default function AdminTeacherChaptersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const { data: chapters = [], isLoading: chaptersLoading } =
    useTeacherChapters({
      page: 1,
      limit: ITEMS_PER_PAGE,
      search: searchTerm || undefined,
    });
  const { mutate: deleteChapter } = useDeleteTeacherChapter();
  const toggleGrade = (gradeId: string) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(gradeId)) {
      newExpanded.delete(gradeId);
    } else {
      newExpanded.add(gradeId);
    }
    setExpandedGrades(newExpanded);
  };
  const toggleUnit = (unitKey: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitKey)) {
      newExpanded.delete(unitKey);
    } else {
      newExpanded.add(unitKey);
    }
    setExpandedUnits(newExpanded);
  };
  const handleDeleteChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c._id === chapterId);
    if (!chapter) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`,
    );
    if (confirmed) {
      deleteChapter(chapterId);
    }
  };
  const handleViewStatistics = (chapterId: string) => {
    router.push(`/dashboard/admin/teacher-chapters/${chapterId}/statistics`);
  };
  const handleEdit = (chapterId: string) => {
    router.push(`/dashboard/admin/teacher-chapters/edit/${chapterId}`);
  };
  const isLoading = gradesLoading || chaptersLoading;
  if (isLoading) {
    return <LoadingState text="Teacher Chapters" />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <TeacherChapterListHeader
          onCreateClick={() =>
            router.push("/dashboard/admin/teacher-chapters/upload")
          }
        />
        <TeacherChapterSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <TeacherChapterGroups
          grades={grades}
          chapters={chapters}
          searchTerm={searchTerm}
          expandedGrades={expandedGrades}
          expandedUnits={expandedUnits}
          onToggleGrade={toggleGrade}
          onToggleUnit={toggleUnit}
          onEdit={handleEdit}
          onDelete={handleDeleteChapter}
          onViewStatistics={handleViewStatistics}
          onCreateClick={() =>
            router.push("/dashboard/admin/teacher-chapters/upload")
          }
        />
      </div>
    </div>
  );
}
