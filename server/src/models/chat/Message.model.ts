import { Schema, model, Document, Types } from "mongoose";
export type MessageType = "broadcast" | "grade" | "unicast";
export type MessageStatus = "sent" | "delivered" | "read";
export interface IMessageRecipient {
  userId: Types.ObjectId;
  role: "admin" | "teacher" | "student" | "superAdmin";
  status: MessageStatus;
  readAt?: Date;
}
export interface IMessage extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: "admin" | "teacher" | "student" | "superAdmin";
  messageType: MessageType;
  content: string;
  gradeId?: Types.ObjectId;
  recipients: IMessageRecipient[];
  attachments?: {
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
  }[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const MessageRecipientSchema = new Schema<IMessageRecipient>(
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
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: Date,
  },
  { _id: false }
);
const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "teacher", "student", "superAdmin"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["broadcast", "grade", "unicast"],
      required: [true, "Message type is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message content cannot exceed 5000 characters"],
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      index: true,
    },
    recipients: {
      type: [MessageRecipientSchema],
      required: true,
      validate: {
        validator: function (v: IMessageRecipient[]) {
          return v.length > 0;
        },
        message: "At least one recipient is required",
      },
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
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
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ "recipients.userId": 1, createdAt: -1 });
MessageSchema.index({ "recipients.userId": 1, "recipients.status": 1 });
MessageSchema.index({ gradeId: 1, createdAt: -1 });
MessageSchema.index({ messageType: 1, createdAt: -1 });
MessageSchema.index({ isDeleted: 1, createdAt: -1 });
MessageSchema.virtual("recipientId").get(function () {
  if (this.recipients && this.recipients.length > 0) {
    return this.recipients[0].userId;
  }
  return null;
});
export const Message = model<IMessage>("Message", MessageSchema);
