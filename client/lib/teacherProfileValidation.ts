export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  gradeId: string;
  qualifications: string;
  specializations: string[];
  address: Address;
  profilePictureUrl?: string;
}
export interface FormErrors {
  [key: string]: string;
}
export interface Grade {
  _id: string;
  grade: string;
  name: string;
}
export interface TeacherResponse {
  success: boolean;
  data: TeacherFormData & {
    _id: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}
export const validateTeacherForm = (formData: TeacherFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!formData.name?.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
    errors.name = "Name must be between 2 and 100 characters";
  }
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
  }
  if (!formData.phone?.trim()) {
    errors.phone = "Phone is required";
  } else {
    const phoneRegex = /^[+]?\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-()]/g, ""))) {
      errors.phone = "Enter a valid phone number (minimum 10 digits)";
    }
  }
  if (!formData.gender) {
    errors.gender = "Gender is required";
  } else if (!["male", "female", "other"].includes(formData.gender.toLowerCase())) {
    errors.gender = "Gender must be male, female, or other";
  }
  if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
    if (age < 18 || age > 100) {
      errors.dateOfBirth = "Teacher must be between 18 and 100 years old";
    }
  }
  if (!formData.gradeId?.trim()) {
    errors.gradeId = "Grade assignment is required";
  }
  if (formData.qualifications && formData.qualifications.length > 500) {
    errors.qualifications = "Qualifications must not exceed 500 characters";
  }
  if (!formData.address?.street?.trim()) {
    errors["address.street"] = "Street address is required";
  }
  if (!formData.address?.city?.trim()) {
    errors["address.city"] = "City is required";
  }
  if (!formData.address?.state?.trim()) {
    errors["address.state"] = "State is required";
  }
  if (!formData.address?.postalCode?.trim()) {
    errors["address.postalCode"] = "Postal code is required";
  } else if (
    formData.address.postalCode.length < 3 ||
    formData.address.postalCode.length > 10
  ) {
    errors["address.postalCode"] = "Postal code must be between 3 and 10 characters";
  }
  return errors;
};
export const validateImageFile = (file: File): string | null => {
  if (file.size > 5 * 1024 * 1024) {
    return "Maximum file size is 5MB";
  }
  if (!file.type.startsWith("image/")) {
    return "Only image files are allowed";
  }
  return null;
};