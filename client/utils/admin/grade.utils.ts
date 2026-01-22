// ===== UTILITIES =====
// lib/utils/grade.utils.ts

import { GradeFormData } from "@/types/admin/grade.types";

export const formatGradePayload = (
  formData: GradeFormData,
  isUpdate = false
) => {
  const payload: any = {
    grade: formData.grade.trim(),
    description: formData.description.trim() || undefined,
    academicYear: formData.academicYear || undefined,
    isActive: formData.isActive,
  };

  if (formData.units.length > 0) {
    payload.units = formData.units.map((unit, index) => ({
      ...(isUpdate && unit._id ? { _id: unit._id } : {}),
      name: unit.name.trim(),
      description: unit.description?.trim(),
      orderIndex: index,
    }));
  }

  return payload;
};

export const getGradeGradient = (index: number): string => {
  const gradients = [
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-pink-500",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-indigo-500",
    "from-cyan-500 to-blue-500",
    "from-teal-500 to-cyan-500",
  ];
  return gradients[index % gradients.length];
};

export const getCompletionColor = (percentage: number): string => {
  if (percentage >= 80) return "from-green-500 to-emerald-500";
  if (percentage >= 50) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-pink-500";
};

export const getCompletionStatus = (
  percentage: number
): { text: string; color: string } => {
  if (percentage >= 80) return { text: "Excellent", color: "text-green-600" };
  if (percentage >= 50) return { text: "Good", color: "text-yellow-600" };
  return { text: "Needs Attention", color: "text-red-600" };
};