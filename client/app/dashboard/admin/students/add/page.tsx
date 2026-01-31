"use client";
import { useRouter } from "next/navigation";
import { StudentFormContainer } from "@/components/admin/students/StudentFormContainer";
export default function AddStudentPage() {
  const router = useRouter();
  return (
    <StudentFormContainer
      mode="create"
      onSuccess={() => router.push("/dashboard/admin/students")}
      onCancel={() => router.back()}
    />
  );
}
