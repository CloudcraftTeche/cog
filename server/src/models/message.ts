import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  recipient?: Types.ObjectId;
  chat?: Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "video" | "pdf" | "system";
  attachments: {
    url: string;
    publicId: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  pinnedBy?: Types.ObjectId;
  reactions: {
    emoji: string;
    users: Types.ObjectId[];
  }[];
  replyTo?: Types.ObjectId;
  status: "sent" | "delivered" | "read";
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
  moderationStatus: "pending" | "approved" | "rejected" | "flagged";
  moderatedBy?: Types.ObjectId;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    content: { type: String, required: true, trim: true },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "pdf", "system"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        publicId: String,
        fileType: String,
        fileName: String,
        fileSize: Number,
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    isPinned: { type: Boolean, default: false },
    pinnedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reactions: [
      {
        emoji: String,
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderationReason: String,
  },
  { timestamps: true }
);

MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ moderationStatus: 1 });

export const Message = model<IMessage>("Message", MessageSchema);