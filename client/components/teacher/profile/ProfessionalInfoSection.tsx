"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Award } from "lucide-react";
import { FormErrors, Grade, TeacherFormData } from "@/lib/teacherProfileValidation";

interface ProfessionalInfoSectionProps {
  formData: TeacherFormData;
  errors: FormErrors;
  grades: Grade[];
  onFieldUpdate: (field: string, value: string) => void;
}

export const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({
  formData,
  errors,
  grades,
  onFieldUpdate,
}) => {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Professional Information
          </span>
          <Award className="h-5 w-5 text-green-500 ml-2" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="space-y-2">
          <Label htmlFor="gradeId" className="text-gray-700 font-semibold">
            Grade Assignment *
          </Label>
          <Select
            value={formData.gradeId || ""}
            onValueChange={(value: string) => onFieldUpdate("gradeId", value)}
          >
            <SelectTrigger
              id="gradeId"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-green-500/20 ${
                errors.gradeId
                  ? "border-red-500 focus:border-red-500"
                  : "border-green-200 focus:border-green-500"
              }`}
            >
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {grades?.map((grade) => (
                <SelectItem key={grade._id} value={grade._id}>
                  {grade.grade} - {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gradeId && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.gradeId}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="qualifications" className="text-gray-700 font-semibold">
            Qualifications
          </Label>
          <Textarea
            id="qualifications"
            value={formData.qualifications || ""}
            onChange={(e) => onFieldUpdate("qualifications", e.target.value)}
            placeholder="e.g., B.Ed in Mathematics, M.Sc in Physics"
            rows={4}
            maxLength={500}
            className="border-2 border-green-200 focus:border-green-500 transition-all duration-200 focus:ring-4 focus:ring-green-500/20"
          />
          {errors.qualifications && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.qualifications}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formData.qualifications?.length || 0}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};