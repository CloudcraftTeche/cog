"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit, Pin, PinOff, Sparkles } from "lucide-react";
import type { Announcement } from "@/app/dashboard/admin/announcements/page";
import Image from "next/image";

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const cardColors = [
    "from-purple-500/20 to-pink-500/20 border-purple-200",
    "from-blue-500/20 to-cyan-500/20 border-blue-200",
    "from-green-500/20 to-emerald-500/20 border-green-200",
    "from-orange-500/20 to-red-500/20 border-orange-200",
    "from-indigo-500/20 to-purple-500/20 border-indigo-200",
    "from-teal-500/20 to-green-500/20 border-teal-200",
  ];

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {announcements?.map((announcement, index) => (
        <Card
          key={announcement?._id || index}
          className={`flex flex-col overflow-hidden relative hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br ${
            cardColors[index % cardColors.length]
          } border-2 rounded-2xl group`}
        >
          {announcement.isPinned && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-3 py-1 rounded-full shadow-lg z-10">
              <Sparkles className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}

          {announcement.type === "image" && announcement.mediaUrl && (
            <div className="relative overflow-hidden">
              <Image
                src={announcement.mediaUrl || "/placeholder.svg"}
                alt={announcement.title}
                className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                height={100}
                width={100}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
          {announcement.type === "video" && announcement.mediaUrl && (
            <div className="relative overflow-hidden">
              <video
                src={announcement.mediaUrl}
                className="w-full h-52 object-cover"
                controls
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          )}

          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
              {announcement?.title}
            </h2>

            <p className="text-gray-600 line-clamp-3 leading-relaxed">
              {announcement?.content}
            </p>

            <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(announcement)}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 rounded-xl"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(announcement._id)}
                  className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-200 rounded-xl"
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onTogglePin(announcement._id, !announcement.isPinned)
                }
                className={`transition-all duration-200 rounded-xl ${
                  announcement.isPinned
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700 hover:from-yellow-100 hover:to-orange-100"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                }`}
              >
                {announcement.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-1" /> Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-1" /> Pin
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
