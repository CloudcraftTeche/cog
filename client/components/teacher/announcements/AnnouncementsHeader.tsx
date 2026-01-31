// components/announcements/AnnouncementsHeader.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Pin,
  FileText,
  Image,
  Video,
} from "lucide-react";
import { FilterType, Announcement } from "@/types/teacher/announcement";

interface AnnouncementsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  announcements: Announcement[] | null | undefined;
  filteredCount: number;
}

export const AnnouncementsHeader = ({
  loading,
  onRefresh,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  announcements,
  filteredCount,
}: AnnouncementsHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: "All", icon: SlidersHorizontal },
      { value: "pinned" as const, label: "Pinned", icon: Pin },
      { value: "text" as const, label: "Text", icon: FileText },
      { value: "image" as const, label: "Image", icon: Image },
      { value: "video" as const, label: "Video", icon: Video },
    ],
    []
  );

  const pinnedCount = useMemo(
    () => announcements?.filter((a) => a.isPinned).length ?? 0,
    [announcements]
  );

  return (
    <div className="bg-white shadow-xl border-b-4 border-emerald-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-1">
                School Announcements
              </h1>
              <p className="text-gray-600 text-lg">
                View all announcements for your grade and school
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search announcements by title or content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Buttons */}
          <div
            className={`flex gap-2 flex-wrap ${
              showFilters ? "block" : "hidden sm:flex"
            }`}
          >
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                    filterType === option.value
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2 flex-wrap">
            <span className="font-medium">
              Total:{" "}
              <span className="text-emerald-600">
                {announcements?.length ?? 0}
              </span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-medium">
              Showing:{" "}
              <span className="text-emerald-600">{filteredCount}</span>
            </span>
            {pinnedCount > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="font-medium flex items-center gap-1">
                  <Pin className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-600">{pinnedCount}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};