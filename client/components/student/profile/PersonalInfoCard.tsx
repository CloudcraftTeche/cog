// components/student/profile/PersonalInfoCard.tsx
"use client";

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
import { StudentFormData } from "@/types/student/student.types";
import { User } from "lucide-react";

interface PersonalInfoCardProps {
  student: StudentFormData;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export function PersonalInfoCard({
  student,
  isEditing,
  onFieldChange,
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
            value={student.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            readOnly={!isEditing}
            className={`transition-all duration-300 ${
              isEditing
                ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
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
            value={student.email}
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
              value={student.phone ?? ""}
              onChange={(e) => onFieldChange("phone", e.target.value)}
              readOnly={!isEditing}
              placeholder="+91 1234567890"
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
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
                value={student.gender ?? ""}
                onValueChange={(value) => onFieldChange("gender", value)}
              >
                <SelectTrigger className="border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50 transition-all duration-300">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="gender"
                value={student.gender ?? ""}
                readOnly
                className="capitalize bg-gray-50/50 border-gray-200"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={student.dateOfBirth ?? ""}
              onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
              readOnly={!isEditing}
              className={`transition-all duration-300 ${
                isEditing
                  ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                  : "bg-gray-50/50 border-gray-200"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollNumber" className="text-gray-700 font-medium">
              Roll Number
            </Label>
            <Input
              id="rollNumber"
              value={student.rollNumber ?? ""}
              readOnly
              disabled
              className="bg-gray-100/50 border-gray-200 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentContact" className="text-gray-700 font-medium">
            Parent Contact
          </Label>
          <Input
            id="parentContact"
            value={student.parentContact ?? ""}
            onChange={(e) => onFieldChange("parentContact", e.target.value)}
            readOnly={!isEditing}
            placeholder="+91 1234567890"
            className={`transition-all duration-300 ${
              isEditing
                ? "border-violet-300 focus:border-violet-500 focus:ring-violet-500 bg-violet-50/50"
                : "bg-gray-50/50 border-gray-200"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}