// app/dashboard/admin/teachers/edit/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import { useEditTeacherForm } from "@/hooks/admin/use-teacher-form";
import { TeacherProfileSidebar } from "@/components/admin/teachers/TeacherProfileSidebar";
import { PersonalInfoSection } from "@/components/admin/teachers/PersonalInfoSection";
import { ProfessionalInfoSection } from "@/components/admin/teachers/ProfessionalInfoSection";
import { AddressInfoSection } from "@/components/admin/teachers/AddressInfoSection";
import { getGradeName } from "@/utils/admin/teacher.utils";
import { LoadingState } from "@/components/shared/LoadingComponent";

export default function EditTeacherPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const {
    formData,
    errors,
    profilePicture,
    previewUrl,
    grades,
    isLoading,
    isFetching,
    updateField,
    handleFileChange,
    handleSubmit,
  } = useEditTeacherForm(id);

  if (isFetching || !formData) {
    return <LoadingState text="teacher data..." />;
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
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
              grade={getGradeName(formData.gradeId, grades)}
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
              onFileChange={handleFileInputChange}
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