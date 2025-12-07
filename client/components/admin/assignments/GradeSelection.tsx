import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
  error 
}: GradeSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-green-600" />
        Select Grades * (Multiple)
      </Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {grades.map((grade) => (
          <div
            key={grade._id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedGradeIds.includes(grade._id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onToggleGrade(grade._id)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedGradeIds.includes(grade._id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <p className="font-semibold text-gray-900">Grade {grade.grade}</p>
                {grade.description && (
                  <p className="text-xs text-gray-600">{grade.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {selectedGradeIds.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            {selectedGradeIds.length} grade{selectedGradeIds.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}