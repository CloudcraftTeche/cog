// app/(dashboard)/announcements/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Pin } from "lucide-react";
import { useAnnouncements } from "@/hooks/teacher/useAnnouncements";
import {
  filterAnnouncements,
  separatePinnedAnnouncements,
} from "@/utils/teacher/announcement";
import { AnnouncementCard } from "@/components/teacher/announcements/AnnouncementCard";
import { AnnouncementModal } from "@/components/teacher/announcements/AnnouncementModal";
import { AnnouncementSkeleton } from "@/components/teacher/announcements/AnnouncementSkeleton";
import { AnnouncementsHeader } from "@/components/teacher/announcements/AnnouncementsHeader";
import { EmptyState, ErrorState } from "@/components/teacher/announcements/AnnouncementStates";
import type { Announcement, FilterType, AnnouncementsFilters } from "@/types/teacher/announcement";

export default function AnnouncementsPage() {
  const { data: announcements, isLoading, error, refetch } = useAnnouncements();

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filters: AnnouncementsFilters = useMemo(
    () => ({
      searchQuery,
      filterType,
    }),
    [searchQuery, filterType]
  );

  const filteredAnnouncements = useMemo(
    () => filterAnnouncements(announcements, filters),
    [announcements, filters]
  );

  const { pinned, regular } = useMemo(
    () => separatePinnedAnnouncements(filteredAnnouncements),
    [filteredAnnouncements]
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <AnnouncementSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <ErrorState error={error} onRetry={() => refetch()} />
      );
    }

    if (filteredAnnouncements.length === 0) {
      return (
        <EmptyState
          hasSearch={searchQuery.length > 0}
          hasFilters={filterType !== "all"}
          onClearFilters={handleClearFilters}
        />
      );
    }

    return (
      <>
        {pinned.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Pin className="w-6 h-6 text-amber-600 fill-current" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Pinned Announcements
              </h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                {pinned.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinned.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  onClick={() => setSelectedAnnouncement(announcement)}
                />
              ))}
            </div>
          </div>
        )}

        {regular.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  All Announcements
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {regular.length}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((announcement) => (
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <AnnouncementsHeader
        loading={isLoading}
        onRefresh={() => refetch()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        announcements={announcements}
        filteredCount={filteredAnnouncements.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
}