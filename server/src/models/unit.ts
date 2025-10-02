import { model, Schema, Types } from "mongoose";

interface IUnit extends Document {
  _id?: Types.ObjectId;
  unit: string;
  chapters: Types.ObjectId[];
}

const unitSchema = new Schema<IUnit>(
  {
    unit: {
      type: String,
      required: [true, "Unit name is required"],
    },
    chapters: [
      {
        type: Types.ObjectId,
        ref: "Chapter",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Unit = model<IUnit>("Unit", unitSchema);
