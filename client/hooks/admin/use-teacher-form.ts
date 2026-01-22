// hooks/admin/use-teacher-form.ts

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TeacherFormData,
  FormErrors,
} from "@/types/admin/teacher.types";
import {
  useCreateTeacher,
  useUpdateTeacher,
  useTeacherForEdit,
} from "@/hooks/admin/useTeachers";
import {
  validateTeacherForm,
  validateProfilePicture,
  isFormValid,
} from "@/lib/admin/validators/teacher.validators";
import { scrollToError } from "@/utils/admin/teacher.utils";

const DEFAULT_FORM_DATA: TeacherFormData = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  gradeId: "",
  qualifications: "",
  specializations: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
  },
};

export const useCreateTeacherForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<TeacherFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const createMutation = useCreateTeacher();

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TeacherFormData] as Record<string, string>),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    const error = validateProfilePicture(file);
    if (error) {
      toast.error(error);
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateTeacherForm(formData);
    
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      scrollToError(validationErrors);
      return;
    }

    createMutation.mutate(
      { formData, profilePicture },
      {
        onSuccess: () => {
          router.push("/dashboard/admin/teachers");
        },
      }
    );
  }, [formData, profilePicture, createMutation, router]);

  return {
    formData,
    errors,
    profilePicture,
    previewUrl,
    isLoading: createMutation.isPending,
    updateField,
    handleFileChange,
    handleSubmit,
  };
};

export const useEditTeacherForm = (teacherId: string) => {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const { teacher, formData, previewUrl, grades, isLoading: isFetching } = 
    useTeacherForEdit(teacherId);

  const [currentFormData, setCurrentFormData] = useState<TeacherFormData | null>(formData);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string>(previewUrl);

  const updateMutation = useUpdateTeacher();

  // Sync form data when teacher data is loaded
  useState(() => {
    if (formData) {
      setCurrentFormData(formData);
    }
    if (previewUrl) {
      setCurrentPreviewUrl(previewUrl);
    }
  });

  const updateField = useCallback((field: string, value: string) => {
    setCurrentFormData((prev) => {
      if (!prev) return prev;

      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TeacherFormData] as Record<string, string>),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    const error = validateProfilePicture(file);
    if (error) {
      toast.error(error);
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = (e) => setCurrentPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentFormData) return;

    const validationErrors = validateTeacherForm(currentFormData);
    
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      scrollToError(validationErrors);
      return;
    }

    updateMutation.mutate(
      { id: teacherId, formData: currentFormData, profilePicture },
      {
        onSuccess: () => {
          router.push("/dashboard/admin/teachers");
        },
      }
    );
  }, [currentFormData, profilePicture, teacherId, updateMutation, router]);

  return {
    formData: currentFormData,
    errors,
    profilePicture,
    previewUrl: currentPreviewUrl,
    grades,
    isLoading: updateMutation.isPending,
    isFetching,
    teacher,
    updateField,
    handleFileChange,
    handleSubmit,
  };
};