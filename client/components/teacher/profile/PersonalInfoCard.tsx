"use client";
import { User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender, Teacher } from "@/types/teacher/profile";
import { GENDER_OPTIONS } from "@/lib/teacher/profile";

interface PersonalInfoCardProps {
  teacher: Teacher;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
  onGenderChange: (value: Gender | null) => void;
  onDateChange: (value: string) => void;
}

export function PersonalInfoCard({
  teacher,
  isEditing,
  onInputChange,
  onGenderChange,
  onDateChange,
}: PersonalInfoCardProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3 shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            value={teacher.name || ""}
            onChange={(e) => onInputChange("name", e.target.value)}
            readOnly={!isEditing}
            className={`transition-all duration-300 ${
              isEditing
                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            value={teacher.email || ""}
            readOnly
            className="bg-gray-100/50 border-gray-200 cursor-not-allowed"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={teacher.phone || ""}
              onChange={(e) => onInputChange("phone", e.target.value)}
              readOnly={!isEditing}
              placeholder="+91 1234567890"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-700 font-medium">
              Gender
            </Label>
            {isEditing ? (
              <Select
                value={teacher.gender || ""}
                onValueChange={(value) =>
                  onGenderChange(value as Gender | null)
                }
              >
                <SelectTrigger className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50 transition-all duration-300">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="gender"
                value={teacher.gender || ""}
                readOnly
                className="capitalize bg-gray-50/50 border-gray-200"
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={teacher.dateOfBirth || ""}
            onChange={(e) => onDateChange(e.target.value)}
            readOnly={!isEditing}
            className={`transition-all duration-300 ${
              isEditing
                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
