// hooks/use-announcement-filters.ts

import { AnnouncementFilters, IAnnouncement } from "@/types/student/announcement.types";
import { useMemo, useState } from "react";

export function useAnnouncementFilters(announcements: IAnnouncement[] | undefined) {
  const [filters, setFilters] = useState<AnnouncementFilters>({
    search: "",
    filterType: "all",
  });

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];

    let filtered = [...announcements];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          a.content.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Type filter
    if (filters.filterType === "pinned") {
      filtered = filtered.filter((a) => a.isPinned);
    } else if (filters.filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filters.filterType);
    }

    return filtered;
  }, [announcements, filters]);

  // Separate pinned and regular announcements
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);

  return {
    filters,
    setFilters,
    filteredAnnouncements,
    pinnedAnnouncements,
    regularAnnouncements,
  };
}