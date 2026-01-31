"use client";
import { useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Teacher } from "@/types/teacher/profile";
import { teacherUtils } from "@/utils/teacher/profile-utils";

interface TeacherAvatarProps {
  teacher: Teacher;
  preview: string;
  isEditing: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TeacherAvatar({
  teacher,
  preview,
  isEditing,
  onImageChange,
}: TeacherAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
      <div className="relative">
        <Avatar className="h-24 w-24 ring-4 ring-white/50 shadow-2xl">
          <AvatarImage src={preview || ""} alt={teacher.name} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-green-500 text-white text-3xl font-bold">
            {teacherUtils.getInitials(teacher.name)}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-110"
            aria-label="Upload profile picture"
          >
            <Camera className="h-4 w-4 text-white" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
          aria-label="Profile picture input"
        />
      </div>
    </div>
  );
}
