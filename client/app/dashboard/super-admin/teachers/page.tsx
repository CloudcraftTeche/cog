"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { ITeacher, TeacherListResponse } from "@/lib/teacherValidation";
import { TeacherListHeader } from "@/components/admin/teachers/TeacherListHeader";
import { TeacherCard } from "@/components/admin/teachers/TeacherCard";
import { Pagination } from "@/components/admin/teachers/Pagination";
export default function TeachersPage() {
  const router = useRouter();
  const [teachersList, setTeachersList] = useState<ITeacher[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 6;
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<TeacherListResponse>("/teachers", {
        params: { page, limit, query },
        headers: { "Content-Type": "application/json" },
      });
      setTeachersList(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      toast.error("Failed to load teachers. Please try again.");
      console.error("Fetch teachers error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTeachers();
  }, [query, page]);
  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await api.delete(`/teachers/${teacherId}`, {
        headers: { "Content-Type": "application/json" },
      });
      setTeachersList((prev) => prev.filter((t) => t._id !== teacherId));
      toast.success("Teacher deleted successfully.");
      fetchTeachers();
    } catch (error) {
      toast.error("Failed to delete teacher. Please try again.");
      console.error("Delete teacher error:", error);
    }
  };
  const handleSearchChange = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  };
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <TeacherListHeader
          searchQuery={query}
          onSearchChange={handleSearchChange}
          onAddNew={() => router.push("/dashboard/super-admin/teachers/add")}
        />
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
          </div>
        ) : teachersList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold text-gray-600">
              No teachers found
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or add a new teacher
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {teachersList.map((teacher, index) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                index={index}
                onEdit={(id) =>
                  router.push(`/dashboard/super-admin/teachers/edit/${id}`)
                }
                onDelete={handleDeleteTeacher}
              />
            ))}
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
