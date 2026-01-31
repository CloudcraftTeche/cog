// components/announcements/AnnouncementCard.tsx
"use client";

import { IAnnouncement } from "@/types/student/announcement.types";
import { formatDate } from "@/utils/student/announcement-utils";
import { Calendar, Users, Pin, Image, Video, FileText } from "lucide-react";

interface AnnouncementCardProps {
  announcement: IAnnouncement;
  onClick: () => void;
}

const TYPE_ICONS = {
  image: Image,
  video: Video,
  text: FileText,
} as const;

export function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
  const TypeIcon = TYPE_ICONS[announcement.type];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-gray-100 group"
      style={{
        borderLeftWidth: "6px",
        borderLeftColor: announcement.accentColor,
      }}
    >
      {announcement.mediaUrl && announcement.type === "image" && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={announcement.mediaUrl}
            alt={announcement.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {announcement.isPinned && (
            <div className="absolute top-3 right-3 p-2 bg-amber-500 rounded-lg shadow-lg">
              <Pin className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg transition-all"
              style={{ backgroundColor: `${announcement.accentColor}20` }}
            >
              <div style={{ color: announcement.accentColor }}>
                <TypeIcon className="w-4 h-4" />
              </div>
            </div>
            {announcement.isPinned && announcement.type !== "image" && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold shadow-sm">
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {announcement.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {announcement.content}
        </p>

        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">{formatDate(announcement.createdAt)}</span>
            </div>
            {announcement.targetAudience === "specific" &&
              announcement.targetGrades.length > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">
                    {announcement.targetGrades.map((g) => g.grade).join(", ")}
                  </span>
                </div>
              )}
            {announcement.targetAudience === "all" && (
              <div className="flex items-center gap-1 text-purple-600 font-medium">
                <Users className="w-4 h-4" />
                <span className="text-xs">All Grades</span>
              </div>
            )}
          </div>
          {announcement.createdBy && (
            <span className="text-xs text-gray-400 italic">
              by {announcement.createdBy.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}