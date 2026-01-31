// types/announcement.types.ts

export type AnnouncementType = "text" | "image" | "video";
export type TargetAudience = "all" | "specific";

export interface IGrade {
  _id: string;
  grade: string;
}

export interface IUser {
  _id: string;
  name: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  mediaUrl?: string;
  accentColor: string;
  isPinned: boolean;
  targetAudience: TargetAudience;
  targetGrades: IGrade[];
  createdBy?: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementFilters {
  search: string;
  filterType: "all" | "pinned" | "text" | "image" | "video";
}

export interface AnnouncementsResponse {
  success: boolean;
  data: IAnnouncement[];
  message?: string;
}

export interface AnnouncementResponse {
  success: boolean;
  data: IAnnouncement;
  message?: string;
}