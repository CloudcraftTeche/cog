"use client";
import { gradeService } from "@/utils/attendanceGrade.service";
import { useState, useEffect } from "react";
interface Grade {
  _id: string;
  grade: string;
  description?: string;
}
interface GradeFilterProps {
  onGradeChange: (gradeId: string | null) => void;
  selectedGradeId: string | null;
  teacherId: string;
}
export default function GradeFilter({ onGradeChange, selectedGradeId, teacherId }: GradeFilterProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (teacherId) {
      fetchTeacherGrades();
    }
  }, [teacherId]);
  const fetchTeacherGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gradeService.getTeacherGrades(teacherId);
      setGrades(data);
    } catch (err: any) {
      console.error("Error fetching teacher grades:", err);
      setError("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md">
        <span className="text-sm text-gray-600">Loading grades...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl shadow-md">
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }
  if (grades.length === 0) {
    return (
      <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-2xl shadow-md">
        <span className="text-sm text-yellow-700">No grades assigned to you</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md">
      <label className="text-sm font-semibold text-gray-700">
        Filter by Grade:
      </label>
      <select
        value={selectedGradeId || "all"}
        onChange={(e) => onGradeChange(e.target.value === "all" ? null : e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
      >
        <option value="all">All My Grades ({grades.length})</option>
        {grades.map((grade) => (
          <option key={grade._id} value={grade._id}>
            {grade.grade}
            {grade.description && ` - ${grade.description}`}
          </option>
        ))}
      </select>
      {selectedGradeId && (
        <button
          onClick={() => onGradeChange(null)}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
}