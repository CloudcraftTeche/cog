
export interface IGrade {
  _id: string;
  grade: string;
}

export interface ICreatedBy {
  _id: string;
  name: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  mediaPublicId?: string;
  accentColor: string;
  isPinned: boolean;
  targetAudience: "all" | "specific";
  targetGrades: IGrade[];
  createdBy?: ICreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  success: boolean;
  data: IAnnouncement[];
}

export interface AnnouncementResponse {
  success: boolean;
  data: IAnnouncement;
  message?: string;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  type: "text" | "image" | "video";
  accentColor: string;
  isPinned: boolean;
  targetAudience: "all" | "specific";
  targetGrades: string[];
  file?: File;
  mediaUrl?: string;
}

export interface UpdateAnnouncementDTO extends Partial<CreateAnnouncementDTO> {
  mediaUrl?: string;
}

export interface UseAnnouncementsParams {
  gradeId?: string;
}

export const ACCENT_COLORS = [
  { name: "Green", value: "#15803d" },
  { name: "Blue", value: "#1e40af" },
  { name: "Purple", value: "#7e22ce" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Pink", value: "#db2777" },
  { name: "Teal", value: "#0f766e" },
  { name: "Indigo", value: "#4f46e5" },
] as const;