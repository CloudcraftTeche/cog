// components/announcements/AnnouncementModal.tsx
"use client";

import { X, Pin, Calendar, Users } from "lucide-react";
import { Announcement } from "@/types/teacher/announcement";
import { formatFullDate, getTargetGradesText } from "@/utils/teacher/announcement";

interface AnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export const AnnouncementModal = ({
  announcement,
  onClose,
}: AnnouncementModalProps) => {
  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 border-b border-gray-200 flex items-center justify-between z-10 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${announcement.accentColor || "#10b981"}15, white)`,
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {announcement.isPinned && (
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Pin className="w-5 h-5 fill-current" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">
                {announcement.title || "Untitled"}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatFullDate(announcement.createdAt)}
                </span>
                {announcement.createdBy?.name && (
                  <span className="flex items-center gap-1">
                    Posted by <strong>{announcement.createdBy.name}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors ml-4 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {announcement.mediaUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              {announcement.type === "image" && (
                <img
                  src={announcement.mediaUrl}
                  alt={announcement.title || "Announcement image"}
                  className="w-full h-auto"
                />
              )}
              {announcement.type === "video" && (
                <video
                  src={announcement.mediaUrl}
                  controls
                  className="w-full h-auto"
                />
              )}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content || "No content available"}
            </p>
          </div>

          {/* Target Audience Info */}
          <div
            className={`mt-6 p-5 rounded-2xl border-2 ${
              announcement.targetAudience === "all"
                ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
                : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-white rounded-lg">
                <Users
                  className={`w-5 h-5 ${
                    announcement.targetAudience === "all"
                      ? "text-purple-600"
                      : "text-emerald-600"
                  }`}
                />
              </div>
              <div>
                <span className="font-semibold text-gray-800 block mb-1">
                  {announcement.targetAudience === "all"
                    ? "Target Audience"
                    : "Target Grades"}
                </span>
                <span
                  className={`font-medium ${
                    announcement.targetAudience === "all"
                      ? "text-purple-700"
                      : "text-emerald-700"
                  }`}
                >
                  {getTargetGradesText(announcement)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};