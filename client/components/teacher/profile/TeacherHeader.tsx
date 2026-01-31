"use client";
import { Edit2, Save, X, Loader2, Sparkles, Award, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherAvatar } from "./TeacherAvatar";
import { Teacher } from "@/types/teacher/profile";

interface TeacherHeaderProps {
  teacher: Teacher;
  profilePreview: string;
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TeacherHeader({
  teacher,
  profilePreview,
  isEditing,
  isUpdating,
  onEdit,
  onSave,
  onCancel,
  onImageChange,
}: TeacherHeaderProps) {
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <TeacherAvatar
              teacher={teacher}
              preview={profilePreview}
              isEditing={isEditing}
              onImageChange={onImageChange}
            />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                {teacher.name}
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Award className="h-3 w-3 mr-1" />
                  Teacher
                </Badge>
                {teacher.email && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <Mail className="h-3 w-3 mr-1" />
                    {teacher.email}
                  </Badge>
                )}
                {teacher.gender && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors capitalize">
                    {teacher.gender}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {!isEditing ? (
            <Button
              onClick={onEdit}
              className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={onSave}
                disabled={isUpdating}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                onClick={onCancel}
                disabled={isUpdating}
                variant="outline"
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
