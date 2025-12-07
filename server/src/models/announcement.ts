import mongoose, { Document, Model, Schema, Types } from "mongoose"


export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  mediaPublicId?: string;
  accentColor: string;
  isPinned: boolean;
  targetAudience: "all" | "specific";
  targetGrades: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_ACCENT_COLOR = "#15803d";

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    mediaUrl: { type: String, trim: true },
    mediaPublicId: { type: String, trim: true },
    accentColor: { type: String, default: DEFAULT_ACCENT_COLOR },
    isPinned: { type: Boolean, default: false, index: true },
    targetAudience: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    targetGrades: [{
      type: Schema.Types.ObjectId,
      ref: "Grade",
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ isPinned: 1, createdAt: -1 });
AnnouncementSchema.index({ targetGrades: 1 });

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

