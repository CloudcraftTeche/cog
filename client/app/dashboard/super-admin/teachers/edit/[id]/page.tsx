"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  FormErrors,
  Grade,
  ITeacher,
  TeacherFormData,
  validateProfilePicture,
  validateTeacherForm,
} from "@/lib/teacherValidation";
import { TeacherProfileSidebar } from "@/components/admin/teachers/TeacherProfileSidebar";
import { PersonalInfoSection } from "@/components/admin/teachers/PersonalInfoSection";
import { ProfessionalInfoSection } from "@/components/admin/teachers/ProfessionalInfoSection";
import { AddressInfoSection } from "@/components/admin/teachers/AddressInfoSection";

export default function EditTeacherPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [formData, setFormData] = useState<TeacherFormData>({
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
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [teacherRes, gradesRes] = await Promise.all([
          api.get<{ success: boolean; data: ITeacher }>(`/teachers/${id}`),
          api.get<{ success: boolean; data: Grade[] }>("grades/all"),
        ]);

        const teacher = teacherRes.data.data;
        setFormData({
          name: teacher.name || "",
          email: teacher.email || "",
          phone: teacher.phone || "",
          gender: teacher.gender || "",
          dateOfBirth: teacher.dateOfBirth
            ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
            : "",
          gradeId: teacher.gradeId || "",
          qualifications: teacher.qualifications || "",
          specializations: teacher.specializations?.join(", ") || "",
          address: {
            street: teacher.address?.street || "",
            city: teacher.address?.city || "",
            state: teacher.address?.state || "",
            country: teacher.address?.country || "India",
            postalCode: teacher.address?.postalCode || "",
          },
        });

        setPreviewUrl(teacher.profilePictureUrl || "");
        setGrades(gradesRes.data.data || []);
      } catch (error) {
        toast.error("Failed to fetch teacher data");
        router.back();
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id, router]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TeacherFormData] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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
    const validationErrors = validateTeacherForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      const formDataObj = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address") {
          Object.entries(value).forEach(([k, v]) =>
            formDataObj.append(`address[${k}]`, String(v))
          );
        } else {
          formDataObj.append(key, value);
        }
      });

      if (profilePicture) {
        formDataObj.append("profilePicture", profilePicture);
      }

      await api.put(`/teachers/${id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Teacher updated successfully");
      router.push("/dashboard/super-admin/teachers");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update teacher";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
      </div>
    );
  }
  const getGradeName = (gradeId: string): string => {
    const grade = grades.find((g) => g._id === gradeId);
    return grade?.grade || "";
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TeacherProfileSidebar
              name={formData.name}
              email={formData.email}
              phone={formData.phone}
              grade={getGradeName(formData.gradeId)}
              qualifications={formData.qualifications}
              city={formData.address.city}
              state={formData.address.state}
              profilePictureUrl={previewUrl}
              headerGradient="from-emerald-500 to-blue-600"
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <PersonalInfoSection
              formData={formData}
              errors={errors}
              profilePicture={profilePicture}
              onFieldChange={updateField}
              onFileChange={handleFileChange}
            />

            <ProfessionalInfoSection
              formData={formData}
              errors={errors}
              grades={grades}
              onFieldChange={updateField}
            />

            <AddressInfoSection
              address={formData.address}
              errors={errors}
              onFieldChange={updateField}
            />
          </div>
        </div>

        <Separator className="my-8 border-emerald-200" />

        <div className="flex justify-end space-x-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-8 py-3 font-semibold transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl px-8 py-3 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[160px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Teacher
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
