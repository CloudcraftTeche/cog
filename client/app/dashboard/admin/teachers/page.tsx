// app/dashboard/admin/teachers/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTeachers, useDeleteTeacher } from "@/hooks/admin/useTeachers";
import { TeacherListHeader } from "@/components/admin/teachers/TeacherListHeader";
import { TeacherCard } from "@/components/admin/teachers/TeacherCard";
import { Pagination } from "@/components/admin/teachers/Pagination";
import { LoadingState } from "@/components/shared/LoadingComponent";
import EmptyState from "@/components/student/chapter/EmptyState";

const LIMIT = 6;

export default function TeachersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTeachers({ page, limit: LIMIT, query });
  const deleteMutation = useDeleteTeacher();

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    deleteMutation.mutate(teacherId);
  };

  const handleSearchChange = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  };

  const teachers = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (isLoading) {
    return <LoadingState text="teachers" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <TeacherListHeader
          searchQuery={query}
          onSearchChange={handleSearchChange}
          onAddNew={() => router.push("/dashboard/admin/teachers/add")}
        />

        {teachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description="Try adjusting your search or add a new teacher"
            actionLabel="Add Teacher"
            onAction={() => router.push("/dashboard/admin/teachers/add")}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {teachers.map((teacher, index) => (
                <TeacherCard
                  key={teacher._id}
                  teacher={teacher}
                  index={index}
                  onEdit={(id) => router.push(`/dashboard/admin/teachers/edit/${id}`)}
                  onDelete={handleDeleteTeacher}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}