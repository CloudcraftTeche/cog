import React from "react";
import { GraduationCap, CheckCircle2, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

interface IGrade {
  _id: string;
  grade: string;
  description?: string;
}

interface GradeSelectionProps {
  grades: IGrade[];
  selectedGradeIds: string[];
  onToggleGrade: (gradeId: string) => void;
  error?: string;
}

export default function GradeSelection({
  grades,
  selectedGradeIds,
  onToggleGrade,
  error,
}: GradeSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-green-600" />
        Select Grades * (Multiple)
      </Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {grades.map((grade) => {
          const isSelected = selectedGradeIds.includes(grade._id);
          
          return (
            <div
              key={grade._id}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              }`}
              onClick={() => onToggleGrade(grade._id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-lg">
                  Grade {grade.grade}
                </p>
                {grade.description && (
                  <p className="text-xs text-gray-600 mt-1">{grade.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {selectedGradeIds.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            {selectedGradeIds.length} grade
            {selectedGradeIds.length > 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}