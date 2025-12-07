import { Schema, Types } from "mongoose";
import { User, IUser } from "./User.model";

export interface IStudent extends IUser {
  rollNumber?: string;
  parentContact?: string;
  gradeId?: Types.ObjectId;
}

const StudentSchema = new Schema<IStudent>({
  rollNumber: { 
    type: String, 
    trim: true, 
    index: true 
  },
  parentContact: { 
    type: String,
    match: [/^\+?[\d\s-()]+$/, "Please provide a valid phone number"],
  },
  gradeId: { 
    type: Schema.Types.ObjectId, 
    ref: "Grade",
    index: true,
  },
});


StudentSchema.index(
  { rollNumber: 1, gradeId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      rollNumber: { $exists: true, $nin: [null, ""] },
      gradeId: { $exists: true, $ne: null }
    },
    name: "rollNumber_gradeId_unique"
  }
);

StudentSchema.index(
  { email: 1 }, 
  { unique: true }
);

export const Student = User.discriminator<IStudent>("student", StudentSchema);