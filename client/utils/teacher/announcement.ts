// lib/utils/announcement.ts
import { Announcement, FilterType, AnnouncementsFilters } from "@/types/teacher/announcement";

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Unknown date";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Invalid date";
  }
};

export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Unknown date";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

export const filterAnnouncements = (
  announcements: Announcement[] | null | undefined,
  filters: AnnouncementsFilters
): Announcement[] => {
  if (!announcements?.length) return [];

  let filtered = [...announcements];

  // Search filter
  if (filters.searchQuery?.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title?.toLowerCase().includes(query) ||
        a.content?.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.filterType === "pinned") {
    filtered = filtered.filter((a) => a.isPinned === true);
  } else if (filters.filterType !== "all") {
    filtered = filtered.filter((a) => a.type === filters.filterType);
  }

  return filtered;
};

export const separatePinnedAnnouncements = (
  announcements: Announcement[] | null | undefined
): {
  pinned: Announcement[];
  regular: Announcement[];
} => {
  if (!announcements?.length) return { pinned: [], regular: [] };

  return {
    pinned: announcements.filter((a) => a.isPinned === true),
    regular: announcements.filter((a) => a.isPinned !== true),
  };
};

export const getTargetGradesText = (announcement: Announcement | null | undefined): string => {
  if (!announcement) return "Unknown";
  if (announcement.targetAudience === "all") return "All Grades";
  if (!announcement.targetGrades?.length) return "No grades specified";
  return announcement.targetGrades.map((g) => g?.grade).filter(Boolean).join(", ");
};