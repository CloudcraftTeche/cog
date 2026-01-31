"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  FormErrors,
  StudentFormData,
  validateProfilePicture,
  validateStudentForm,
} from "@/lib/studentValidation";
import { StudentProfileCard } from "@/components/admin/students/StudentProfileCard";
import { StudentAddressForm } from "@/components/admin/students/StudentAddressForm";
import { StudentInfoFormTeacher } from "@/components/teacher/students/StudentInfoFormTeacher";
export default function TeacherAddStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [teacherGrade, setTeacherGrade] = useState<{
    _id: string;
    grade: string;
  } | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
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
  });
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const response = await api.get("/auth/me");
        const gradeId = response.data.data.gradeId;
        setTeacherGrade({ _id: gradeId._id, grade: gradeId.grade });
        setFormData((prev) => ({ ...prev, gradeId: gradeId._id }));
      } catch (error) {
        toast.error("Failed to load teacher information");
        router.push("/dashboard/teacher/students");
      }
    };
    fetchTeacherInfo();
  }, []);
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
    if (errors[field]) {
      setErrors((prev: any) => {
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
  const handleSave = async () => {
    const validationErrors = validateStudentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix all validation errors");
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(
        firstErrorField.replace("address.", ""),
      );
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("email", formData.email.trim().toLowerCase());
      formDataObj.append("gender", formData.gender.toLowerCase());
      formDataObj.append("dateOfBirth", formData.dateOfBirth);
      formDataObj.append("parentContact", formData.parentContact.trim());
      if (formData.rollNumber && formData.rollNumber.trim()) {
        formDataObj.append("rollNumber", formData.rollNumber.trim());
      }
      Object.entries(formData.address).forEach(([key, value]) => {
        formDataObj.append(`address[${key}]`, value.trim());
      });
      if (profilePicture) {
        formDataObj.append("profilePicture", profilePicture);
      }
      await api.post("/students/teacher/students", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Student created successfully");
      router.push("/dashboard/teacher/students");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create student";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            backendErrors[err.field] = err.message;
          }
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (!teacherGrade) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading...
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-6">
      {}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <UserPlus className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">Add New Student</h1>
            <p className="text-indigo-100 text-lg">
              Adding to {teacherGrade.grade}
            </p>
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <StudentProfileCard
            name={formData.name}
            email={formData.email}
            rollNumber={formData.rollNumber}
            gradeId={formData.gradeId}
            gradeName={teacherGrade.grade}
            parentContact={formData.parentContact}
            dateOfBirth={formData.dateOfBirth}
            city={formData.address.city}
            state={formData.address.state}
            previewUrl={previewUrl}
          />
        </div>
        {}
        <div className="lg:col-span-2 space-y-8">
          <StudentInfoFormTeacher
            formData={formData}
            errors={errors}
            gradeName={teacherGrade.grade}
            profilePicture={profilePicture}
            onFieldChange={updateField}
            onFileChange={handleFileChange}
          />
          <StudentAddressForm
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
          />
        </div>
      </div>
      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />
      {}
      <div className="flex justify-end space-x-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-8 py-3 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 min-w-[160px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <UserPlus className="h-5 w-5 mr-2" /> Create Student
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
