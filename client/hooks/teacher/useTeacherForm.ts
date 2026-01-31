import { Gender, Teacher } from "@/types/teacher/profile";
import { teacherFormUtils } from "@/utils/teacher/profile-form";
import { teacherUtils } from "@/utils/teacher/profile-utils";
import { useState, useCallback, useRef } from "react";

export function useTeacherForm(initialTeacher: Teacher) {
  const [editedTeacher, setEditedTeacher] = useState<Teacher>(initialTeacher);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    initialTeacher.profilePictureUrl || ""
  );
  const [specializationInput, setSpecializationInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setEditedTeacher((prev) =>
        teacherFormUtils.handleInputChange(field, value, prev)
      );
    },
    []
  );

  const handleGenderChange = useCallback((value: Gender | null) => {
    setEditedTeacher((prev) =>
      teacherFormUtils.handleGenderChange(value, prev)
    );
  }, []);

  const handleDateChange = useCallback((value: string) => {
    setEditedTeacher((prev) =>
      teacherFormUtils.handleDateChange(value, prev)
    );
  }, []);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = teacherUtils.validateImageFile(file);
      if (!validation.valid) {
        return { error: validation.error };
      }

      setProfileImage(file);
      try {
        const preview = await teacherUtils.fileToDataURL(file);
        setProfileImagePreview(preview);
      } catch {
        return { error: "Failed to load image preview" };
      }
    },
    []
  );

  const addSpecialization = useCallback(() => {
    const updated = teacherFormUtils.addSpecialization(
      specializationInput,
      editedTeacher
    );
    if (updated) {
      setEditedTeacher(updated);
      setSpecializationInput("");
    }
  }, [specializationInput, editedTeacher]);

  const removeSpecialization = useCallback((index: number) => {
    setEditedTeacher((prev) =>
      teacherFormUtils.removeSpecialization(index, prev)
    );
  }, []);

  const resetForm = useCallback(() => {
    setEditedTeacher(initialTeacher);
    setProfileImage(null);
    setProfileImagePreview(initialTeacher.profilePictureUrl || "");
    setSpecializationInput("");
  }, [initialTeacher]);

  const getFormData = useCallback((): FormData => {
    return teacherUtils.createFormData(editedTeacher, profileImage);
  }, [editedTeacher, profileImage]);

  const hasChanges = useCallback((): boolean => {
    return (
      teacherUtils.hasChanged(initialTeacher, editedTeacher) ||
      profileImage !== null
    );
  }, [initialTeacher, editedTeacher, profileImage]);

  return {
    editedTeacher,
    profileImage,
    profileImagePreview,
    specializationInput,
    fileInputRef,
    handleInputChange,
    handleGenderChange,
    handleDateChange,
    handleImageChange,
    addSpecialization,
    removeSpecialization,
    resetForm,
    getFormData,
    hasChanges,
    setSpecializationInput,
  };
}