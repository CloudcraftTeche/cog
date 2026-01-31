"use client";

import { useRouter, useParams } from "next/navigation";
import { StudentFormContainer } from "@/components/admin/students/StudentFormContainer";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  return (
    <StudentFormContainer
      mode="edit"
      studentId={studentId}
      onSuccess={() => router.push("/dashboard/super-admin/students")}
      onCancel={() => router.back()}
    />
  );
}
