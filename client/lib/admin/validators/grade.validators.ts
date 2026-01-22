// ===== VALIDATORS =====
// lib/validators/grade.validators.ts

import { GradeFormData, ValidationErrors } from "@/types/admin/grade.types";

export const validateGradeForm = (
  formData: GradeFormData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate grade name
  if (!formData.grade.trim()) {
    errors.grade = "Grade is required";
  } else if (
    formData.grade.trim().length < 1 ||
    formData.grade.trim().length > 50
  ) {
    errors.grade = "Grade must be between 1-50 characters";
  }

  // Validate description
  if (formData.description && formData.description.length > 500) {
    errors.description = "Description must not exceed 500 characters";
  }

  // Validate academic year
  if (formData.academicYear) {
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(formData.academicYear)) {
      errors.academicYear =
        "Academic year must be in format YYYY-YYYY (e.g., 2024-2025)";
    } else {
      const [startYear, endYear] = formData.academicYear
        .split("-")
        .map(Number);
      if (endYear !== startYear + 1) {
        errors.academicYear = "End year must be one year after start year";
      }
    }
  }

  // Validate units
  if (formData.units.length > 0) {
    const hasInvalidUnit = formData.units.some((unit) => {
      if (!unit.name.trim()) return true;
      if (unit.name.length < 1 || unit.name.length > 100) return true;
      if (unit.description && unit.description.length > 500) return true;
      return false;
    });

    if (hasInvalidUnit) {
      errors.units =
        "All units must have valid names (1-100 chars) and descriptions (max 500 chars)";
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};