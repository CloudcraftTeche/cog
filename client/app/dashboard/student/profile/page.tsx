"use client";
import { useState, useRef, ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";
import { ProfileHeader } from "@/components/student/profile/ProfileHeader";
import { PersonalInfoCard } from "@/components/student/profile/PersonalInfoCard";
import { AddressInfoCard } from "@/components/student/profile/AddressInfoCard";
import { StudentFormData } from "@/types/student/student.types";
import { useStudent, useUpdateStudent } from "@/hooks/student/use-student";
import {
  formatStudentData,
  validateImageFile,
} from "@/utils/student/student-utils";
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <Loader2 className="relative animate-spin w-12 h-12 text-violet-600" />
      </div>
    </div>
  );
}
export default function StudentDetailsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [editedStudent, setEditedStudent] = useState<StudentFormData>({
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    gradeId: "",
    gender: undefined,
    dateOfBirth: "",
    parentContact: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  });
  const { data: studentData, isLoading } = useStudent(user?.id);
  const student = studentData?.data;
  const { mutate: updateStudent, isPending: isSaving } = useUpdateStudent(
    user?.id,
  );
  useState(() => {
    if (student) {
      const formatted = formatStudentData(student);
      setEditedStudent(formatted);
      setProfileImagePreview(student.profilePictureUrl || "");
    }
  });
  const handleEdit = () => {
    if (student) {
      setIsEditing(true);
      setEditedStudent(formatStudentData(student));
    }
  };
  const handleCancel = () => {
    if (student) {
      setIsEditing(false);
      setEditedStudent(formatStudentData(student));
      setProfileImage(null);
      setProfileImagePreview(student.profilePictureUrl || "");
    }
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleSave = () => {
    updateStudent(
      {
        ...editedStudent,
        profileImage: profileImage ?? undefined,
      },
      {
        onSuccess: (data) => {
          setIsEditing(false);
          setProfileImage(null);
          if (data.data.profilePictureUrl) {
            setProfileImagePreview(data.data.profilePictureUrl);
          }
          toast.success("Profile updated successfully");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to update profile");
        },
      },
    );
  };
  const handleFieldChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setEditedStudent((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditedStudent((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  if (isLoading || !student) {
    return <LoadingState />;
  }
  const displayStudent = isEditing ? editedStudent : formatStudentData(student);
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {}
        <ProfileHeader
          student={displayStudent}
          isEditing={isEditing}
          isSaving={isSaving}
          profileImagePreview={profileImagePreview}
          fileInputRef={fileInputRef}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onImageChange={handleImageChange}
        />
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PersonalInfoCard
            student={displayStudent}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
          <AddressInfoCard
            student={displayStudent}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
