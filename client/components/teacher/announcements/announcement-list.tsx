"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

import Image from "next/image";
 interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  accentColor: string;
  isPinned: boolean;
  targetAudience: "all" | "specific";
  targetGrades: Array<{ _id: string; grade: string }>;
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
 
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,

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
                src={announcement.mediaUrl || "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"}
                alt={announcement.title}
                className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                width={100}
                height={100}
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

         
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
