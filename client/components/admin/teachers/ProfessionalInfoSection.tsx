"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap } from "lucide-react";
import { FormErrors, Grade } from "@/lib/teacherValidation";
interface ProfessionalInfoSectionProps {
  formData: {
    gradeId: string;
    qualifications: string;
  };
  errors: FormErrors;
  grades: Grade[];
  onFieldChange: (field: string, value: string) => void;
}
export function ProfessionalInfoSection({
  formData,
  errors,
  grades,
  onFieldChange,
}: ProfessionalInfoSectionProps) {
  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-xl mr-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          Professional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <Label htmlFor="gradeId" className="text-gray-700 font-semibold">
            Assigned Grade *
          </Label>
          <Select value={formData.gradeId} onValueChange={(value) => onFieldChange("gradeId", value)}>
            <SelectTrigger
              id="gradeId"
              className={`rounded-2xl border-2 transition-all duration-300 ${
                errors.gradeId
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
              } focus:ring-4`}
            >
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {grades?.map((grade) => (
                <SelectItem key={grade._id} value={grade._id}>
                  {grade.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gradeId && <p className="text-sm text-red-500 font-medium">{errors.gradeId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualifications" className="text-gray-700 font-semibold">
            Qualifications
          </Label>
          <Textarea
            id="qualifications"
            value={formData.qualifications}
            onChange={(e) => onFieldChange("qualifications", e.target.value)}
            placeholder="e.g., B.Ed in Mathematics, M.Sc in Physics"
            rows={3}
            className="rounded-2xl border-2 transition-all duration-300 focus:border-purple-400 focus:ring-purple-100 focus:ring-4"
          />
        </div>
      </CardContent>
    </Card>
  );
}