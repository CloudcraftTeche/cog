import { FormErrors, TeacherFormData } from "@/types/admin/teacher.types";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const validateProfilePicture = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return "File size should not exceed 5MB";
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP formats are allowed";
  }

  return null;
};

export const validateTeacherForm = (formData: TeacherFormData): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Invalid email format";
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
    errors.phone = "Phone number must be 10 digits";
  }

  // Gender validation
  if (!formData.gender) {
    errors.gender = "Gender is required";
  }

  // Date of Birth validation
  if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18 || age > 100) {
      errors.dateOfBirth = "Age must be between 18 and 100 years";
    }
  }

  // Grade validation
  if (!formData.gradeId) {
    errors.gradeId = "Grade assignment is required";
  }

  // Address validation
  if (!formData.address.city.trim()) {
    errors["address.city"] = "City is required";
  }

  if (!formData.address.state.trim()) {
    errors["address.state"] = "State is required";
  }

  if (!formData.address.country.trim()) {
    errors["address.country"] = "Country is required";
  }

  const postalCodeRegex = /^[0-9]{6}$/;
  if (formData.address.postalCode && !postalCodeRegex.test(formData.address.postalCode)) {
    errors["address.postalCode"] = "Postal code must be 6 digits";
  }

  return errors;
};



export const hasValidationErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};



export const isFormValid = (errors: FormErrors): boolean => {
  return Object.keys(errors).length === 0;
};