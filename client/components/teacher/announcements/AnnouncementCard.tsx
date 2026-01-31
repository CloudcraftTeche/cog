// components/announcements/AnnouncementCard.tsx
"use client";

import { useMemo } from "react";
import {
  Pin,
  Calendar,
  Users,
  Image,
  Video,
  FileText,
} from "lucide-react";
import { Announcement } from "@/types/teacher/announcement";
import { formatDate, getTargetGradesText } from "@/utils/teacher/announcement";

interface AnnouncementCardProps {
  announcement: Announcement | null;
  onClick: () => void;
}

export const AnnouncementCard = ({
  announcement,
  onClick,
}: AnnouncementCardProps) => {
  const typeIcon = useMemo(() => {
    switch (announcement?.type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  }, [announcement?.type]);

  if (!announcement) {
    return <div className="bg-white rounded-2xl shadow-lg p-6 h-64" />;
  }

  const hasImage =
    announcement.mediaUrl && announcement.type === "image";
  const gradesText = getTargetGradesText(announcement);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-gray-100 group"
      style={{
        borderLeftWidth: "6px",
        borderLeftColor: announcement.accentColor || "#10b981",
      }}
    >
      {hasImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={announcement.mediaUrl || ""}
            alt={announcement.title || "Announcement"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
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
              style={{
                backgroundColor: `${announcement.accentColor || "#10b981"}20`,
              }}
            >
              <div style={{ color: announcement.accentColor || "#10b981" }}>
                {typeIcon}
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
          {announcement.title || "Untitled"}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {announcement.content || "No content"}
        </p>

        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {formatDate(announcement.createdAt)}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 font-medium ${
                announcement.targetAudience === "all"
                  ? "text-purple-600"
                  : "text-emerald-600"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">{gradesText}</span>
            </div>
          </div>

          {announcement.createdBy?.name && (
            <span className="text-xs text-gray-400 italic">
              by {announcement.createdBy.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};