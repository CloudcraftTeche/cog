import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  _id: Types.ObjectId;
  name: string;
  chatType: "class" | "private" | "broadcast";
  class?: string;
  participants: Types.ObjectId[];
  admins: Types.ObjectId[];
  moderators: Types.ObjectId[];
  isActive: boolean;
  requiresApproval: boolean;
  allowFileSharing: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  pinnedMessages: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastActivity: Date;
  settings: {
    allowReactions: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
    muteNotifications: boolean;
  };
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    name: { type: String, required: true, trim: true },
    chatType: {
      type: String,
      enum: ["class", "private", "broadcast"],
      required: true,
    },
    class: { type: String, trim: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: false },
    allowFileSharing: { type: Boolean, default: true },
    maxFileSize: { type: Number, default: 10 * 1024 * 1024 }, 
    allowedFileTypes: [String],
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastActivity: { type: Date, default: Date.now },
    settings: {
      allowReactions: { type: Boolean, default: true },
      allowReplies: { type: Boolean, default: true },
      allowEditing: { type: Boolean, default: false },
      allowDeletion: { type: Boolean, default: false },
      muteNotifications: { type: Boolean, default: false },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ChatSchema.index({ chatType: 1, isActive: 1 });
ChatSchema.index({ class: 1 });
ChatSchema.index({ participants: 1 });

export const Chat = model<IChat>("Chat", ChatSchema);