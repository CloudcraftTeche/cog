"use client";

import { useState, useEffect } from "react";
import { Megaphone, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementList } from "@/components/teacher/announcements/announcement-list";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  createdAt: Date;
  accentColor?: string;
  isPinned?: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await api.get("/announcements");
        setAnnouncements(res.data?.data);
      } catch {
        toast.error("Failed to fetch announcements.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
      <div className="container mx-auto px-6 ">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 border-2 border-purple-100 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-30" />
                  <div className="relative p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent text-balance leading-tight">
                    Announcements
                  </h1>
                  <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    Share important updates with your community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="space-y-4 p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100"
              >
                <Skeleton className="h-8 w-2/3 rounded-xl bg-gradient-to-r from-purple-200 to-blue-200" />
                <Skeleton className="h-4 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-4 w-5/6 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
                <Skeleton className="h-48 w-full rounded-2xl bg-gradient-to-br from-indigo-200 to-purple-200" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-xl bg-gradient-to-r from-blue-200 to-indigo-200" />
                  <Skeleton className="h-8 w-20 rounded-xl bg-gradient-to-r from-red-200 to-pink-200" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-2xl opacity-20" />
              <div className="relative p-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                <Megaphone className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              No announcements yet
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Create your first announcement to start engaging with your
              community!
            </p>
          </div>
        ) : (
          <AnnouncementList announcements={announcements} />
        )}
      </div>
    </div>
  );
}
