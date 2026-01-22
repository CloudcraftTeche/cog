"use client";

import {
  StudentFormData,
  FormErrors,
  Grade,
} from "@/types/admin/student.types";
import { StudentProfileCard } from "./StudentProfileCard";
import { StudentInfoForm } from "./StudentInfoForm";
import { StudentAddressForm } from "./StudentAddressForm";

interface StudentFormLayoutProps {
  formData: StudentFormData;
  errors: FormErrors;
  grades: Grade[];
  profilePicture: File | null;
  previewUrl: string;
  currentProfileUrl?: string;
  selectedGradeName: string;
  onFieldChange: (field: string, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudentFormLayout = ({
  formData,
  errors,
  grades,
  profilePicture,
  previewUrl,
  currentProfileUrl,
  selectedGradeName,
  onFieldChange,
  onFileChange,
}: StudentFormLayoutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <StudentProfileCard
          name={formData.name}
          email={formData.email}
          rollNumber={formData.rollNumber}
          gradeId={formData.gradeId}
          gradeName={selectedGradeName}
          parentContact={formData.parentContact}
          dateOfBirth={formData.dateOfBirth}
          city={formData.address.city}
          state={formData.address.state}
          previewUrl={previewUrl}
          currentProfileUrl={currentProfileUrl}
        />
      </div>

      <div className="lg:col-span-2 space-y-8">
        <StudentInfoForm
          formData={formData}
          errors={errors}
          grades={grades}
          profilePicture={profilePicture}
          onFieldChange={onFieldChange}
          onFileChange={onFileChange}
        />

        <StudentAddressForm
          formData={formData}
          errors={errors}
          onFieldChange={onFieldChange}
        />
      </div>
    </div>
  );
};