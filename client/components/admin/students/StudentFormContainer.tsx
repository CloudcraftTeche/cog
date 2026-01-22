"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  useStudent,
  useGrades,
  useCreateStudent,
  useUpdateStudent,
} from "@/hooks/admin/useStudents";
import {
  validateStudentForm,
  validateProfilePicture,
} from "@/lib/studentValidation";
import { scrollToFirstError } from "@/utils/admin/student.utils";
import { StudentFormData, FormErrors } from "@/types/admin/student.types";
import { StudentFormHeader } from "./StudentFormHeader";
import { StudentFormLayout } from "./StudentFormLayout";
import { StudentFormActions } from "./StudentFormActions";

interface StudentFormContainerProps {
  mode: "create" | "edit";
  studentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialFormData: StudentFormData = {
  name: "",
  email: "",
  rollNumber: "",
  gradeId: "",
  gender: "",
  dateOfBirth: "",
  parentContact: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
  },
};

export const StudentFormContainer = ({
  mode,
  studentId,
  onSuccess,
  onCancel,
}: StudentFormContainerProps) => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");

  // Queries
  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const {
    data: student,
    isLoading: isLoadingStudent,
    error: studentError,
  } = useStudent(mode === "edit" ? studentId || null : null);

  // Mutations
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const isLoading =
    createMutation.isPending || updateMutation.isPending;
  const isLoadingData = mode === "edit" && (isLoadingStudent || isLoadingGrades);

  // Load student data for edit mode
  useEffect(() => {
    if (mode === "edit" && student && grades.length > 0) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        rollNumber: student.rollNumber || "",
        gradeId: student.gradeId || "",
        gender: student.gender || "",
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.split("T")[0]
          : "",
        parentContact: student.parentContact || "",
        address: {
          street: student.address?.street || "",
          city: student.address?.city || "",
          state: student.address?.state || "",
          country: student.address?.country || "India",
          postalCode: student.address?.postalCode || "",
        },
      });

      const currentGrade = grades.find(
        (g) => g._id === student.gradeId || g.grade === student.gradeId
      );

      if (currentGrade) {
        setSelectedGradeName(currentGrade.grade);
        if (student.gradeId === currentGrade.grade) {
          setFormData((prev) => ({ ...prev, gradeId: currentGrade._id }));
        }
      }
    }
  }, [mode, student, grades]);

  // Handle student fetch error
  useEffect(() => {
    if (studentError) {
      toast.error("Failed to load student data");
      onCancel();
    }
  }, [studentError, onCancel]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof StudentFormData] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });

    if (field === "gradeId") {
      const selectedGrade = grades.find((g) => g._id === value);
      setSelectedGradeName(selectedGrade?.grade || "");
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
  };

  const handleSubmit = async () => {
    const validationErrors = validateStudentForm(formData, mode === "edit");
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix all validation errors");
      scrollToFirstError(validationErrors);
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({ formData, profilePicture });
      } else if (studentId) {
        await updateMutation.mutateAsync({
          id: studentId,
          formData,
          profilePicture,
        });
      }
      onSuccess();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            backendErrors[err.field] = err.message;
          }
        });
        setErrors(backendErrors);
      }
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading student data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <StudentFormHeader mode={mode} />

      {mode === "edit" && (
        <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            You are editing student information. Changes will be saved
            immediately upon submission.
          </AlertDescription>
        </Alert>
      )}

      <StudentFormLayout
        formData={formData}
        errors={errors}
        grades={grades}
        profilePicture={profilePicture}
        previewUrl={previewUrl}
        currentProfileUrl={student?.profilePictureUrl}
        selectedGradeName={selectedGradeName}
        onFieldChange={updateField}
        onFileChange={handleFileChange}
      />

      <StudentFormActions
        mode={mode}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};