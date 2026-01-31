// components/student/profile/ProfileHeader.tsx
"use client";

import { RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Edit2,
  Save,
  X,
  Loader2,
  Mail,
  Sparkles,
  Camera,
} from "lucide-react";
import { StudentFormData } from "@/types/student/student.types";
import { getInitials } from "@/utils/student/student-utils";

interface ProfileHeaderProps {
  student: StudentFormData;
  isEditing: boolean;
  isSaving: boolean;
  profileImagePreview: string;
  fileInputRef: RefObject<HTMLInputElement>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  student,
  isEditing,
  isSaving,
  profileImagePreview,
  fileInputRef,
  onEdit,
  onSave,
  onCancel,
  onImageChange,
}: ProfileHeaderProps) {
  const defaultAvatar =
    "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg";

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white/50 shadow-2xl">
                  <AvatarImage
                    src={profileImagePreview || defaultAvatar}
                    alt={student.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-pink-500 text-white text-3xl font-bold">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all hover:scale-110"
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
                />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                {student.name}
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                {student.rollNumber && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {student.rollNumber}
                  </Badge>
                )}
                {student.email && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <Mail className="h-3 w-3 mr-1" />
                    {student.email}
                  </Badge>
                )}
                {student.gender && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors capitalize">
                    {student.gender}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <Button
              onClick={onEdit}
              className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isSaving}
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}