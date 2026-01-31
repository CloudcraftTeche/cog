// lib/types/announcement.ts

export type AnnouncementType = "text" | "image" | "video";
export type TargetAudience = "all" | "specific";
export type FilterType = "all" | "pinned" | "text" | "image" | "video";

export interface Grade {
  _id: string;
  grade: string;
}

export interface User {
  _id: string;
  name: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  mediaUrl?: string | null;
  accentColor: string;
  isPinned: boolean;
  targetAudience: TargetAudience;
  targetGrades: Grade[];
  createdBy?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  data: Announcement[];
  total?: number;
}

export interface AnnouncementsFilters {
  searchQuery: string;
  filterType: FilterType;
}