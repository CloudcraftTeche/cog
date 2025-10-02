import { Document, model, Schema, Types, Model } from "mongoose";


export interface IGrade extends Document {
  _id: Types.ObjectId;
  grade: string;
  students: Types.ObjectId[];
  teachers: Types.ObjectId[];
  units: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const gradeSchema = new Schema<IGrade>(
  {
    grade: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    teachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    units: [
      {
        type: Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const Grade: Model<IGrade> = model<IGrade>("Grade", gradeSchema);
