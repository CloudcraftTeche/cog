import { Teacher } from "@/types/teacher/profile";
import { FILE_VALIDATION } from "@/lib/teacher/profile";

export const teacherUtils = {
  // Format API response to form state
  formatTeacherData: (apiData: any): Teacher => ({
    id: apiData.id || "",
    name: apiData.name || "",
    email: apiData.email || "",
    phone: apiData.phone || null,
    qualifications: apiData.qualifications || null,
    specializations: apiData.specializations || [],
    gradeId: apiData.gradeId || null,
    gender: apiData.gender || null,
    dateOfBirth: apiData.dateOfBirth
      ? apiData.dateOfBirth.split("T")[0]
      : null,
    address: {
      street: apiData.address?.street || null,
      city: apiData.address?.city || null,
      state: apiData.address?.state || null,
      country: apiData.address?.country || "India",
      postalCode: apiData.address?.postalCode || null,
    },
    profilePictureUrl: apiData.profilePictureUrl || null,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  }),

  // Validate image file
  validateImageFile: (file: File): { valid: boolean; error?: string } => {
    if (file.size > FILE_VALIDATION.MAX_SIZE) {
      return { valid: false, error: "Image size should be less than 5MB" };
    }
    if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp")) {
      return { valid: false, error: "Please select a valid image file" };
    }
    return { valid: true };
  },

  // Convert file to data URL for preview
  fileToDataURL: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Create FormData from teacher data
  createFormData: (teacher: Teacher, profileFile?: File | null): FormData => {
    const formData = new FormData();

    Object.entries(teacher).forEach(([key, value]) => {
      if (value === undefined || value === null || key === "id") {
        return;
      }

      if (key === "address") {
        const addressData = Object.entries(value).reduce(
          (acc, [addrKey, addrValue]) => {
            if (addrValue !== null && addrValue !== undefined) {
              acc[addrKey] = addrValue;
            }
            return acc;
          },
          {} as Record<string, any>
        );
        formData.append(key, JSON.stringify(addressData));
      } else if (key === "specializations") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (profileFile) {
      formData.append("profilePicture", profileFile);
    }

    return formData;
  },

  // Get teacher initials for avatar
  getInitials: (name: string | null | undefined): string => {
    if (!name) return "T";
    return name.charAt(0).toUpperCase();
  },

  // Check if teacher data has changed
  hasChanged: (original: Teacher, edited: Teacher): boolean => {
    return JSON.stringify(original) !== JSON.stringify(edited);
  },
};