export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
export interface ITeacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date | string;
  profilePictureUrl?: string;
  profilePicturePublicId?: string;
  address?: IAddress;
  qualifications?: string;
  specializations?: string[];
  gradeId:
    | {
        _id: string;
        grade: string;
        section?: string;
      }
    | any;
  createdBy: string;
  role: "teacher";
  createdAt: Date | string;
  updatedAt: Date | string;
}
export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  gradeId: string;
  qualifications: string;
  specializations: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}
export interface FormErrors {
  [key: string]: string;
}
export interface TeacherListResponse {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: ITeacher[];
}
export interface Grade {
  _id: string;
  grade: string;
  section?: string;
}
export const validateTeacherForm = (formData: TeacherFormData): FormErrors => {
  const errors: FormErrors = {};
  const { name, email, phone, gender, dateOfBirth, gradeId, address } =
    formData;
  if (!name?.trim()) errors.name = "Name is required";
  if (!email?.trim()) errors.email = "Email is required";
  if (!phone?.trim()) errors.phone = "Phone is required";
  if (!gender) errors.gender = "Gender is required";
  if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!gradeId?.trim()) errors.gradeId = "Grade assignment is required";
  if (!address?.street?.trim())
    errors["address.street"] = "Street address is required";
  if (!address?.city?.trim()) errors["address.city"] = "City is required";
  if (!address?.state?.trim()) errors["address.state"] = "State is required";
  if (!address?.postalCode?.trim())
    errors["address.postalCode"] = "Postal code is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }
  const phoneRegex = /^[+]?\d{10,}$/;
  if (phone && !phoneRegex.test(phone)) {
    errors.phone = "Enter a valid phone number (minimum 10 digits)";
  }
  if (dateOfBirth) {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18 || age > 80) {
      errors.dateOfBirth = "Age must be between 18 and 80 years";
    }
  }
  if (
    address?.postalCode &&
    (address.postalCode.length < 3 || address.postalCode.length > 10)
  ) {
    errors["address.postalCode"] =
      "Postal code must be between 3 and 10 characters";
  }
  return errors;
};
export const validateProfilePicture = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (file.size > maxSize) {
    return "File size must not exceed 5MB";
  }
  if (!allowedTypes.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }
  return null;
};
export const getInitials = (name: string): string => {
  return (
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T"
  );
};
