import { Schema, model, Document, Types } from "mongoose";

export type ChatRoomType = "direct" | "grade" | "broadcast";

export interface IChatParticipant {
  userId: Types.ObjectId;
  role: "admin" | "teacher" | "student" | "superAdmin";
  joinedAt: Date;
  lastReadAt?: Date;
  unreadCount: number;
}

export interface IChatRoom extends Document {
  _id: Types.ObjectId;
  roomType: ChatRoomType;
  name: string;
  gradeId?: Types.ObjectId;
  participants: IChatParticipant[];
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
    sentAt: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatParticipantSchema = new Schema<IChatParticipant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "superAdmin"],
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastReadAt: Date,
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    roomType: {
      type: String,
      enum: ["direct", "grade", "broadcast"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      index: true,
    },
    participants: {
      type: [ChatParticipantSchema],
      required: true,
      validate: {
        validator: function (v: IChatParticipant[]) {
          return v.length > 0;
        },
        message: "At least one participant is required",
      },
    },
    lastMessage: {
      content: String,
      senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      sentAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

ChatRoomSchema.index({ "participants.userId": 1, isActive: 1 });
ChatRoomSchema.index({ gradeId: 1, roomType: 1 });
ChatRoomSchema.index({ roomType: 1, isActive: 1 });
ChatRoomSchema.index({ "lastMessage.sentAt": -1 });

export const ChatRoom = model<IChatRoom>("ChatRoom", ChatRoomSchema);