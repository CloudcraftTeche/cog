import { Schema, model, Document, Types } from "mongoose";
interface IAttachment {
  url: string;
  publicId: string;
  fileType: string;
  fileName: string;
}
interface IResponse {
  from: Types.ObjectId;
  content: string;
  attachments: IAttachment[];
  responseType: "reply" | "broadcast" | "escalation";
  createdAt: Date;
}
export interface IQuery extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  subject: string;
  content: string;
  queryType:
    | "general"
    | "academic"
    | "disciplinary"
    | "doctrinal"
    | "technical";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "escalated" | "closed";
  isSensitive: boolean;
  attachments: IAttachment[];
  responses: IResponse[];
  assignedTo?: Types.ObjectId;
  escalatedFrom?: Types.ObjectId;
  escalationReason?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  tags: string[];
  lastActivity: Date;
  satisfactionRating?: number;
  createdAt: Date;
  updatedAt: Date;
}
const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, required: true },
    fileName: { type: String, required: true },
  },
  { _id: false }
);
const ResponseSchema = new Schema<IResponse>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Response author is required"],
    },
    content: {
      type: String,
      required: [true, "Response content is required"],
    },
    attachments: [AttachmentSchema],
    responseType: {
      type: String,
      enum: {
        values: ["reply", "broadcast", "escalation"],
        message: "{VALUE} is not a valid response type",
      },
      default: "reply",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
const QuerySchema = new Schema<IQuery>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    queryType: {
      type: String,
      enum: {
        values: [
          "general",
          "academic",
          "disciplinary",
          "doctrinal",
          "technical",
        ],
        message: "{VALUE} is not a valid query type",
      },
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "{VALUE} is not a valid priority level",
      },
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in_progress", "resolved", "escalated", "closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "open",
      index: true,
    },
    isSensitive: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [AttachmentSchema],
    responses: [ResponseSchema],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    escalatedFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    escalationReason: {
      type: String,
      trim: true,
    },
    resolvedAt: { type: Date },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
      },
    ],
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    satisfactionRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  { timestamps: true }
);
QuerySchema.index({ status: 1, priority: -1, lastActivity: -1 });
QuerySchema.index({ from: 1, status: 1 });
QuerySchema.index({ to: 1, status: 1 });
QuerySchema.index({ assignedTo: 1, status: 1 });
QuerySchema.index({ tags: 1, status: 1 });
QuerySchema.pre("save", function (next) {
  if (this.isModified("responses")) {
    this.lastActivity = new Date();
  }
  next();
});
export const Query = model<IQuery>("Query", QuerySchema);
