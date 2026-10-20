"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTeachers, useDeleteTeacher } from "@/hooks/admin/useTeachers";
import { TeacherListHeader } from "@/components/admin/teachers/TeacherListHeader";
import { TeachersTable } from "@/components/admin/teachers/TeachersTable";
import EmptyState from "@/components/student/chapter/EmptyState";

// The table sorts, filters and pages in the browser, so load every teacher at once.
const ALL_TEACHERS_LIMIT = 1000;

export default function TeachersPage() {
  const router = useRouter();

  const { data, isLoading, isFetching } = useTeachers({ page: 1, limit: ALL_TEACHERS_LIMIT });
  const deleteMutation = useDeleteTeacher();

  const handleEditTeacher = useCallback(
    (teacherId: string) => router.push(`/dashboard/admin/teachers/edit/${teacherId}`),
    [router]
  );

  const handleDeleteTeacher = useCallback(
    (teacherId: string) => {
      if (!window.confirm("Are you sure you want to delete this teacher?")) return;
      deleteMutation.mutate(teacherId);
    },
    [deleteMutation]
  );

  const teachers = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <TeacherListHeader
          totalTeachers={total}
          onAddNew={() => router.push("/dashboard/admin/teachers/add")}
        />
        {!isLoading && teachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description="Try adjusting your search or add a new teacher"
            actionLabel="Add Teacher"
            onAction={() => router.push("/dashboard/admin/teachers/add")}
          />
        ) : (
          <TeachersTable
            teachers={teachers}
            loading={isFetching || deleteMutation.isPending}
            onEdit={handleEditTeacher}
            onDelete={handleDeleteTeacher}
          />
        )}
      </div>
    </div>
  );
}