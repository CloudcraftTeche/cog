
import { FormErrors, StudentFormData } from "@/types/admin/student.types";

export const validateStudentForm = (
  formData: StudentFormData,
  isEdit: boolean = false
): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (formData.name.trim().length > 100) {
    errors.name = "Name must not exceed 100 characters";
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  // Roll number validation (optional)
  if (formData.rollNumber && formData.rollNumber.trim()) {
    if (
      formData.rollNumber.trim().length < 1 ||
      formData.rollNumber.trim().length > 50
    ) {
      errors.rollNumber = "Roll number must be between 1 and 50 characters";
    }
  }

  // Grade validation
  if (!formData.gradeId || !formData.gradeId.trim()) {
    errors.gradeId = "Grade is required";
  } else {
    const objectIdRegex = /^[a-f\d]{24}$/i;
    if (!objectIdRegex.test(formData.gradeId.trim())) {
      errors.gradeId = "Invalid grade selection";
    }
  }

  // Gender validation
  if (!formData.gender) {
    errors.gender = "Gender is required";
  } else if (
    !["male", "female", "other"].includes(formData.gender.toLowerCase())
  ) {
    errors.gender = "Please select a valid gender";
  }

  // Date of birth validation
  if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      errors.dateOfBirth = "Date of birth must be in the past";
    } else {
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
      if (actualAge < 3 || actualAge > 25) {
        errors.dateOfBirth = "Student age must be between 3 and 25 years";
      }
    }
  }

  // Parent contact validation
  if (!formData.parentContact.trim()) {
    errors.parentContact = "Parent contact is required";
  } else {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(formData.parentContact)) {
      errors.parentContact =
        "Please enter a valid phone number (minimum 10 digits)";
    }
  }

  // Address validation
  if (!formData.address.street.trim()) {
    errors["address.street"] = "Street address is required";
  }
  if (!formData.address.city.trim()) {
    errors["address.city"] = "City is required";
  }
  if (!formData.address.state.trim()) {
    errors["address.state"] = "State is required";
  }
  if (!formData.address.postalCode.trim()) {
    errors["address.postalCode"] = "Postal code is required";
  }

  return errors;
};

export const validateProfilePicture = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (file.size > maxSize) {
    return "File size must be less than 5MB";
  }

  if (!allowedTypes.includes(file.type)) {
    return "Only image files (JPEG, PNG, GIF, WEBP) are allowed";
  }

  return null;
};

export const hasValidationErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};