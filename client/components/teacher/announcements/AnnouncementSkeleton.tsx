// components/announcements/AnnouncementSkeleton.tsx
"use client";

export const AnnouncementSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};