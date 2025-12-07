"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/teacherValidation";

interface TeacherProfileSidebarProps {
  name: string;
  email: string;
  phone: string;
  grade: string;
  qualifications?: string;
  city?: string;
  state?: string;
  profilePictureUrl?: string;
  headerGradient?: string;
}

export function TeacherProfileSidebar({
  name,
  email,
  phone,
  grade,
  qualifications,
  city,
  state,
  profilePictureUrl,
  headerGradient = "from-blue-500 to-purple-600",
}: TeacherProfileSidebarProps) {
  const locationText = city && state ? `${city}, ${state}` : city || state || "Not set";

  return (
    <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-blue-50 overflow-hidden">
      <CardHeader className={`text-center pb-6 bg-gradient-to-r ${headerGradient} text-white relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-white/50 shadow-2xl">
              {profilePictureUrl ? (
                <Image
                  src={profilePictureUrl}
                  alt="Profile"
                  className="object-cover"
                  height={112}
                  width={112}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-3xl font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{name || "Teacher Name"}</h3>
            <p className="text-blue-100 font-medium">Grade {grade || "Grade Not Assigned"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-blue-400">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Email</p>
            <p className="text-xs text-gray-600 truncate font-medium">{email || "Not set"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-400">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Phone</p>
            <p className="text-xs text-gray-600 font-medium">{phone || "Not set"}</p>
          </div>
        </div>
        {qualifications && (
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-l-4 border-purple-400">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Qualifications</p>
              <p className="text-xs text-gray-600 font-medium">{qualifications}</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-l-4 border-orange-400">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-400 rounded-xl">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">Location</p>
            <p className="text-xs text-gray-600 font-medium">{locationText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}