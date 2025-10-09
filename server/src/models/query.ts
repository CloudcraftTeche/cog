import { Schema, model, Document, Types } from "mongoose";

export interface IQuery extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  subject: string;
  content: string;
  queryType: "general" | "academic" | "disciplinary" | "doctrinal" | "technical";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "escalated" | "closed";
  isSensitive: boolean;
  attachments: {
    url: string;
    publicId: string;
    fileType: string;
    fileName: string;
  }[];
  responses: {
    from: Types.ObjectId;
    content: string;
    attachments: {
      url: string;
      publicId: string;
      fileType: string;
      fileName: string;
    }[];
    responseType: "reply" | "broadcast" | "escalation";
    createdAt: Date;
  }[];
  assignedTo?: Types.ObjectId;
  escalatedFrom?: Types.ObjectId;
  escalationReason?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  tags: string[];
  lastActivity: Date;
  sla?: {
    remaining?: string;
    completed?: string;
  };
  satisfactionRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuerySchema = new Schema<IQuery>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    queryType: {
      type: String,
      enum: ["general", "academic", "disciplinary", "doctrinal", "technical"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "escalated", "closed"],
      default: "open",
    },
    isSensitive: { type: Boolean, default: false },
    attachments: [
      {
        url: String,
        publicId: String,
        fileType: String,
        fileName: String,
      },
    ],
    responses: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        attachments: [
          {
            url: String,
            publicId: String,
            fileType: String,
            fileName: String,
          },
        ],
        responseType: {
          type: String,
          enum: ["reply", "broadcast", "escalation"],
          default: "reply",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    escalatedFrom: { type: Schema.Types.ObjectId, ref: "User" },
    escalationReason: String,
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    tags: [String],
    lastActivity: { type: Date, default: Date.now },
    sla: {
      remaining: String,
      completed: String,
    },
    satisfactionRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Indexes
QuerySchema.index({ from: 1, status: 1 });
QuerySchema.index({ to: 1, status: 1 });
QuerySchema.index({ status: 1, priority: -1 });
QuerySchema.index({ createdAt: -1 });
QuerySchema.index({ assignedTo: 1 });
QuerySchema.index({ lastActivity: -1 });

// Virtual for calculating SLA
QuerySchema.virtual("calculatedSLA").get(function () {
  const now = new Date();
  const created = this.createdAt;
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  const slaHours: Record<string, number> = {
    urgent: 4,
    high: 8,
    medium: 24,
    low: 48,
  };

  const targetHours = slaHours[this.priority] || 24;
  const remaining = targetHours - hoursDiff;

  if (this.status === "resolved" && this.resolvedAt) {
    const resolutionTime = (this.resolvedAt.getTime() - created.getTime()) / (1000 * 60 * 60);
    return {
      completed: `${resolutionTime.toFixed(1)} hours`,
    };
  }

  if (remaining > 0) {
    return {
      remaining: `${remaining.toFixed(1)} hours`,
    };
  } else {
    return {
      remaining: `Overdue by ${Math.abs(remaining).toFixed(1)} hours`,
    };
  }
});

QuerySchema.pre("save", function (next) {
  this.lastActivity = new Date();
  next();
});

export const Query = model<IQuery>("Query", QuerySchema);