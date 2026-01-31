"use client";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Teacher } from "@/types/teacher/profile";

interface ProfessionalInfoCardProps {
  teacher: Teacher
  ;
  isEditing: boolean;
  specializationInput: string;
  onQualificationsChange: (value: string) => void;
  onSpecializationInputChange: (value: string) => void;
  onAddSpecialization: () => void;
  onRemoveSpecialization: (index: number) => void;
}

export function ProfessionalInfoCard({
  teacher,
  isEditing,
  specializationInput,
  onQualificationsChange,
  onSpecializationInputChange,
  onAddSpecialization,
  onRemoveSpecialization,
}: ProfessionalInfoCardProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3 shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          Professional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <div className="space-y-2">
          <Label htmlFor="qualifications" className="text-gray-700 font-medium">
            Qualifications
          </Label>
          <Textarea
            id="qualifications"
            value={teacher.qualifications || ""}
            onChange={(e) => onQualificationsChange(e.target.value)}
            readOnly={!isEditing}
            placeholder="e.g., M.Ed., B.Sc. in Mathematics"
            rows={3}
            className={`transition-all duration-300 ${
              isEditing
                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>

        {isEditing && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <Label className="text-gray-700 font-medium">Specializations</Label>
            <div className="flex gap-2">
              <Input
                value={specializationInput}
                onChange={(e) => onSpecializationInputChange(e.target.value)}
                placeholder="Add specialization"
                className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddSpecialization();
                  }
                }}
              />
              <Button
                onClick={onAddSpecialization}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
              >
                Add
              </Button>
            </div>
            {teacher.specializations && teacher.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teacher.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pl-3">
                    {spec}
                    <button
                      onClick={() => onRemoveSpecialization(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {!isEditing && teacher.specializations && teacher.specializations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <Label className="text-gray-700 font-medium">Specializations</Label>
            <div className="flex flex-wrap gap-2">
              {teacher.specializations.map((spec, index) => (
                <Badge key={index} variant="outline">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
