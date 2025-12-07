"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, GraduationCap, MapPin } from "lucide-react";
import { TeacherFormData } from "@/lib/teacherProfileValidation";

interface TeacherProfileCardProps {
  formData: TeacherFormData;
  previewUrl: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "T";
};

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({
  formData,
  previewUrl,
}) => {
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardHeader className="text-center pb-4 relative">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30"></div>
            <Avatar className="h-28 w-28 ring-4 ring-white shadow-xl relative">
              {formData?.profilePictureUrl || previewUrl ? (
                <Image
                  src={formData.profilePictureUrl || previewUrl}
                  alt="Profile preview"
                  className="object-cover"
                  height={112}
                  width={112}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                  {getInitials(formData?.name || "")}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formData.name || "Teacher Name"}
            </h3>
          
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="flex items-center space-x-4 p-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Email</p>
            <p className="text-sm text-gray-600 truncate">
              {formData.email || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Phone</p>
            <p className="text-sm text-gray-600">{formData.phone || "Not provided"}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Qualifications</p>
            <p className="text-sm text-gray-600">
              {formData.qualifications || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Location</p>
            <p className="text-sm text-gray-600">
              {formData.address?.city && formData.address?.state
                ? `${formData.address.city}, ${formData.address.state}`
                : "Not provided"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};