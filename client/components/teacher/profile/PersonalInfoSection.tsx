"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Upload, Sparkles } from "lucide-react";
import { FormErrors, TeacherFormData } from "@/lib/teacherProfileValidation";

interface PersonalInfoSectionProps {
  formData: TeacherFormData;
  errors: FormErrors;
  profilePicture: File | null;
  onFieldUpdate: (field: string, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  profilePicture,
  onFieldUpdate,
  onFileChange,
}) => {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center text-xl font-bold">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Personal Information
          </span>
          <Sparkles className="h-5 w-5 text-blue-500 ml-2" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => onFieldUpdate("name", e.target.value)}
              placeholder="Enter full name"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                errors.name ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onFieldUpdate("email", e.target.value)}
              placeholder="Enter email address"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-semibold">
              Phone *
            </Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => onFieldUpdate("phone", e.target.value)}
              placeholder="Enter phone number"
              className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                errors.phone ? "border-red-500 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.phone}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-700 font-semibold">
              Gender *
            </Label>
            <Select
              value={formData.gender || ""}
              onValueChange={(value: string) => onFieldUpdate("gender", value)}
            >
              <SelectTrigger
                className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
                  errors.gender
                    ? "border-red-500 focus:border-red-500"
                    : "border-blue-200 focus:border-blue-500"
                }`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.gender}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold">
            Date of Birth *
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
            onChange={(e) => onFieldUpdate("dateOfBirth", e.target.value)}
            className={`border-2 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 ${
              errors.dateOfBirth
                ? "border-red-500 focus:border-red-500"
                : "border-blue-200 focus:border-blue-500"
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.dateOfBirth}
            </p>
          )}
        </div>

      
      </CardContent>
    </Card>
  );
};