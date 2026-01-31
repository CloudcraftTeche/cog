"use client";
import { useState } from "react";
import {
  Bell,
  Pin,
  Search,
  AlertCircle,
  RefreshCw,
  Image,
  Video,
  FileText,
  Filter,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { IAnnouncement } from "@/types/student/announcement.types";
import { useAnnouncements } from "@/hooks/student/use-announcements";
import { useAnnouncementFilters } from "@/hooks/student/use-announcement-filters";
import { AnnouncementSkeleton } from "@/components/student/announcements/AnnouncementSkeleton";
import { AnnouncementCard } from "@/components/student/announcements/AnnouncementCard";
import { AnnouncementModal } from "@/components/student/announcements/AnnouncementModal";
const filterOptions = [
  { value: "all", label: "All", icon: SlidersHorizontal },
  { value: "pinned", label: "Pinned", icon: Pin },
  { value: "text", label: "Text", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
] as const;
const AnnouncementsPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<IAnnouncement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, error, refetch } = useAnnouncements();
  const announcements = data?.data ?? [];
  const {
    filters,
    setFilters,
    filteredAnnouncements,
    pinnedAnnouncements,
    regularAnnouncements,
  } = useAnnouncementFilters(announcements);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {}
      <div className="bg-white shadow-xl border-b-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
          {}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search announcements by title or content..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
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
                    onClick={() =>
                      setFilters({ ...filters, filterType: option.value })
                    }
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                      filters.filterType === option.value
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
            {}
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
              <span className="font-medium">
                Total:{" "}
                <span className="text-emerald-600">{announcements.length}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-medium">
                Showing:{" "}
                <span className="text-emerald-600">
                  {filteredAnnouncements.length}
                </span>
              </span>
              {pinnedAnnouncements.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium flex items-center gap-1">
                    <Pin className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-600">
                      {pinnedAnnouncements.length}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AnnouncementSkeleton key={i} />
            ))}
          </div>
        )}
        {}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-2">
              Error Loading Announcements
            </h3>
            <p className="text-red-600 mb-6 text-lg">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
        {}
        {!isLoading && !error && filteredAnnouncements.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              No Announcements Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {filters.search || filters.filterType !== "all"
                ? "No announcements match your search criteria. Try adjusting your filters."
                : "There are no announcements available at the moment. Check back later!"}
            </p>
            {(filters.search || filters.filterType !== "all") && (
              <button
                onClick={() => setFilters({ search: "", filterType: "all" })}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        {}
        {!isLoading && !error && filteredAnnouncements.length > 0 && (
          <>
            {}
            {pinnedAnnouncements.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Pin className="w-6 h-6 text-amber-600 fill-current" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Pinned Announcements
                  </h2>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {pinnedAnnouncements.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            )}
            {}
            {regularAnnouncements.length > 0 && (
              <div>
                {pinnedAnnouncements.length > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                      All Announcements
                    </h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {regularAnnouncements.length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};
export default AnnouncementsPage;
