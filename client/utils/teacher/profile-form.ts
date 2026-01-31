import { Gender, Teacher } from "@/types/teacher/profile";

export const teacherFormUtils = {
  // Handle text input changes
  handleInputChange: (
    field: string,
    value: string,
    teacher: Teacher
  ): Teacher => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      return {
        ...teacher,
        address: {
          ...teacher.address,
          [addressField]: value || null,
        },
      };
    }

    return {
      ...teacher,
      [field]: value || null,
    };
  },

  // Handle gender change
  handleGenderChange: (value: Gender | null, teacher: Teacher): Teacher => ({
    ...teacher,
    gender: value,
  }),

  // Handle date change
  handleDateChange: (value: string, teacher: Teacher): Teacher => ({
    ...teacher,
    dateOfBirth: value || null,
  }),

  // Add specialization
  addSpecialization: (
    specialization: string,
    teacher: Teacher
  ): Teacher | null => {
    const trimmed = specialization.trim();
    if (!trimmed || teacher.specializations.includes(trimmed)) {
      return null;
    }
    return {
      ...teacher,
      specializations: [...teacher.specializations, trimmed],
    };
  },

  // Remove specialization
  removeSpecialization: (index: number, teacher: Teacher): Teacher => ({
    ...teacher,
    specializations: teacher.specializations.filter((_, i) => i !== index),
  }),
};