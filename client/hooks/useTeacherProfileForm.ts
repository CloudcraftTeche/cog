import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormErrors, Grade, TeacherFormData, validateImageFile, validateTeacherForm } from "@/lib/teacherProfileValidation";
import { teacherService } from "@/lib/teacherProfileService";
export const useTeacherForm = (teacherId: string | undefined) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    specializations: [],
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    profilePictureUrl: "",
  });
  useEffect(() => {
    if (!teacherId) {
      toast.error("Teacher ID not found");
      router.back();
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [teacherResponse, gradesResponse] = await Promise.all([
          teacherService.getTeacherById(teacherId),
          teacherService.getGrades(),
        ]);
        const teacherData = teacherResponse.data;
        setFormData({
          name: teacherData.name || "",
          email: teacherData.email || "",
          phone: teacherData.phone || "",
          gender: teacherData.gender || "",
          dateOfBirth: teacherData.dateOfBirth || "",
          gradeId: teacherData.gradeId || "",
          qualifications: teacherData.qualifications || "",
          specializations: teacherData.specializations || [],
          address: {
            street: teacherData.address?.street || "",
            city: teacherData.address?.city || "",
            state: teacherData.address?.state || "",
            country: teacherData.address?.country || "India",
            postalCode: teacherData.address?.postalCode || "",
          },
          profilePictureUrl: teacherData.profilePictureUrl || "",
        });
        setPreviewUrl(teacherData.profilePictureUrl || "");
        setGrades(gradesResponse.data || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch teacher data");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId, router]);
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
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleSave = async () => {
    const validationErrors = validateTeacherForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      return;
    }
    if (!teacherId) {
      toast.error("Teacher ID is missing");
      return;
    }
    setIsSaving(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address") {
          Object.entries(value).forEach(([k, v]) => {
            formDataObj.append(`address[${k}]`, String(v));
          });
        } else if (key === "specializations") {
          (value as string[]).forEach((spec, index) => {
            formDataObj.append(`specializations[${index}]`, spec);
          });
        } else if (value !== null && value !== undefined) {
          formDataObj.append(key, String(value));
        }
      });
      if (profilePicture) {
        formDataObj.append("profilePicture", profilePicture);
      }
      await teacherService.updateTeacher(teacherId, formDataObj);
      toast.success("Teacher profile updated successfully");
      router.push("/dashboard/teacher");
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      const errorMessage = error?.response?.data?.message || "Failed to update teacher profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  return {
    formData,
    errors,
    profilePicture,
    previewUrl,
    grades,
    isLoading,
    isSaving,
    updateField,
    handleFileChange,
    handleSave,
  };
};