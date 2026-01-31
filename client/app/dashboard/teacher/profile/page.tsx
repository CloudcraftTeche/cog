"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherQuery } from "@/hooks/teacher/useTeacherQuery";
import { useTeacherForm } from "@/hooks/teacher/useTeacherForm";
import { TEACHER_FORM_DEFAULTS } from "@/lib/teacher/profile";
import { TeacherLoadingState } from "@/components/teacher/profile/TeacherLoadingState";
import { TeacherErrorState } from "@/components/teacher/profile/TeacherErrorState";
import { TeacherHeader } from "@/components/teacher/profile/TeacherHeader";
import { PersonalInfoCard } from "@/components/teacher/profile/PersonalInfoCard";
import { ProfessionalInfoCard } from "@/components/teacher/profile/ProfessionalInfoCard";
import { AddressCard } from "@/components/teacher/profile/AddressCard";
export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { teacher, isLoading, isError, error, isUpdating, updateTeacher } =
    useTeacherQuery(user?.id);
  const form = useTeacherForm(teacher || TEACHER_FORM_DEFAULTS);
  useEffect(() => {
    if (teacher) {
      form.resetForm();
    }
  }, [teacher?.id]);
  if (isLoading) {
    return <TeacherLoadingState />;
  }
  if (isError) {
    return (
      <TeacherErrorState
        error={error as Error | null}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (!teacher) {
    return (
      <TeacherErrorState
        error={new Error("No teacher profile found")}
        onRetry={() => window.location.reload()}
      />
    );
  }
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    form.resetForm();
  };
  const handleSave = async () => {
    if (!form.hasChanges()) {
      setIsEditing(false);
      return;
    }
    try {
      const formData = form.getFormData();
      await updateTeacher(formData);
      setIsEditing(false);
    } catch {}
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <TeacherHeader
          teacher={isEditing ? form.editedTeacher : teacher}
          profilePreview={form.profileImagePreview}
          isEditing={isEditing}
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onImageChange={async (e) => {
            const result = await form.handleImageChange(e);
            if (result?.error) {
            }
          }}
        />
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <PersonalInfoCard
            teacher={isEditing ? form.editedTeacher : teacher}
            isEditing={isEditing}
            onInputChange={form.handleInputChange}
            onGenderChange={form.handleGenderChange}
            onDateChange={form.handleDateChange}
          />
          {}
          <ProfessionalInfoCard
            teacher={isEditing ? form.editedTeacher : teacher}
            isEditing={isEditing}
            specializationInput={form.specializationInput}
            onQualificationsChange={(value) =>
              form.handleInputChange("qualifications", value)
            }
            onSpecializationInputChange={form.setSpecializationInput}
            onAddSpecialization={form.addSpecialization}
            onRemoveSpecialization={form.removeSpecialization}
          />
        </div>
        {}
        <AddressCard
          teacher={isEditing ? form.editedTeacher : teacher}
          isEditing={isEditing}
          onInputChange={form.handleInputChange}
        />
      </div>
    </div>
  );
}
