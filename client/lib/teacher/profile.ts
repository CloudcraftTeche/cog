import { Gender, Teacher } from "@/types/teacher/profile";

export const TEACHER_QUERY_KEYS = {
  all: ["teacher"] as const,
  detail: (id: string) => [...TEACHER_QUERY_KEYS.all, "detail", id] as const,
} as const;

export const TEACHER_DEFAULTS: Omit<Teacher, "id"> = {
  name: "",
  email: "",
  phone: null,
  qualifications: null,
  specializations: [],
  gradeId: null,
  gender: null,
  dateOfBirth: null,
  address: {
    street: null,
    city: null,
    state: null,
    country: "India",
    postalCode: null,
  },
  profilePictureUrl: null,
};

export const TEACHER_FORM_DEFAULTS: Teacher = {
  id: "",
  ...TEACHER_DEFAULTS,
};

export const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const FILE_VALIDATION = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "Image size should be less than 5MB",
  INVALID_FILE_TYPE: "Please select a valid image file",
  FETCH_FAILED: "Failed to fetch teacher data",
  UPDATE_FAILED: "Failed to update profile",
  UNKNOWN_ERROR: "An unexpected error occurred",
} as const;

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
} as const;