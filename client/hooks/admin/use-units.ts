// hooks/use-units.ts

import { useMemo } from "react";
import { Grade, Unit } from "@/types/admin/teacher-chapter.types";

export function useUnitsForGrades(selectedGrades: string[], grades: Grade[]) {
  const units = useMemo<Unit[]>(() => {
    if (selectedGrades.length === 0) {
      return [];
    }

    const firstGradeId = selectedGrades[0];
    const selectedGrade = grades.find((g) => g._id === firstGradeId);
    
    if (selectedGrade?.units) {
      return [...selectedGrade.units].sort((a, b) => a.orderIndex - b.orderIndex);
    }
    
    return [];
  }, [selectedGrades, grades]);

  return {
    units,
    isLoading: false,
    hasUnits: units.length > 0,
    hasGradesSelected: selectedGrades.length > 0,
  };
}

export function useUnitsForGrade(selectedGradeId: string, grades: Grade[]) {
  const units = useMemo<Unit[]>(() => {
    if (!selectedGradeId || grades.length === 0) {
      return [];
    }

    const selectedGrade = grades.find((g) => g._id === selectedGradeId);
    
    if (selectedGrade?.units) {
      return [...selectedGrade.units].sort((a, b) => a.orderIndex - b.orderIndex);
    }
    
    return [];
  }, [selectedGradeId, grades]);

  return {
    units,
    isLoading: false,
    hasUnits: units.length > 0,
    hasGradeSelected: !!selectedGradeId,
  };
}