import { Schema, Types } from "mongoose";
export interface IUnit {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  orderIndex: number;
}
export const UnitSchema = new Schema<IUnit>(
  {
    name: {
      type: String,
      required: [true, "Unit name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Order index must be non-negative"],
    },
  },
  { timestamps: true }
);
