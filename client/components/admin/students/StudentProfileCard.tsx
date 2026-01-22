"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Mail, Phone, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { getInitials, calculateAge } from "@/utils/admin/student.utils";
import { ProfileCardData } from "@/types/admin/student.types";

export const StudentProfileCard = ({
  name,
  email,
  rollNumber,
  gradeId,
  gradeName,
  parentContact,
  dateOfBirth,
  city,
  state,
  previewUrl,
  currentProfileUrl,
}: ProfileCardData) => {
  const displayImage = previewUrl || currentProfileUrl;
  const location = city && state ? `${city}, ${state}` : "Not set";

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
              {displayImage ? (
                <Image
                  src={displayImage}
                  height={112}
                  width={112}
                  alt="Profile preview"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">{name || "Student Name"}</h3>
            <p className="text-blue-100 font-medium">
              Grade {gradeName || gradeId || "Grade"}
            </p>
            {rollNumber && (
              <p className="text-xs text-blue-200 bg-white/20 px-3 py-1 rounded-full mt-2 inline-block">
                Roll No: {rollNumber}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <InfoItem
          icon={Mail}
          label="Email"
          value={email || "Not set"}
          gradient="from-blue-50 to-indigo-50"
          iconGradient="from-blue-500 to-indigo-500"
          borderColor="border-blue-100"
        />

        <InfoItem
          icon={Phone}
          label="Parent Contact"
          value={parentContact || "Not set"}
          gradient="from-emerald-50 to-teal-50"
          iconGradient="from-emerald-500 to-teal-500"
          borderColor="border-emerald-100"
        />

        <InfoItem
          icon={Calendar}
          label="Age"
          value={calculateAge(dateOfBirth) || "Not set"}
          gradient="from-purple-50 to-pink-50"
          iconGradient="from-purple-500 to-pink-500"
          borderColor="border-purple-100"
        />

        <InfoItem
          icon={MapPin}
          label="Location"
          value={location}
          gradient="from-orange-50 to-amber-50"
          iconGradient="from-orange-500 to-amber-500"
          borderColor="border-orange-100"
        />
      </CardContent>
    </Card>
  );
};

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
  iconGradient: string;
  borderColor: string;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  gradient,
  iconGradient,
  borderColor,
}: InfoItemProps) => (
  <div
    className={`flex items-center space-x-4 p-4 bg-gradient-to-r ${gradient} rounded-2xl border ${borderColor} shadow-sm`}
  >
    <div className={`p-2 bg-gradient-to-r ${iconGradient} rounded-xl`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 truncate">{value}</p>
    </div>
  </div>
);