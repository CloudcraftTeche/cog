import { Schema } from "mongoose";
import { User, IUser } from "./User.model";
export interface IAdmin extends IUser {
  permissions?: string[];
}
const AdminSchema = new Schema<IAdmin>({
  permissions: [
    {
      type: String,
      enum: ["manage_users", "manage_grades", "view_reports", "manage_content"],
    },
  ],
});
AdminSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const adminId = this._id;
      const { Teacher } = await import("./Teacher.model");
      await Teacher.updateMany(
        { createdBy: adminId },
        { $unset: { createdBy: "" } }
      );
      next();
    } catch (error: any) {
      console.error("Error in Admin cascading delete:", error);
      next(error);
    }
  }
);
AdminSchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDelete = await this.model.findOne(this.getFilter());
    if (docToDelete) {
      await docToDelete.deleteOne();
    }
    next();
  } catch (error: any) {
    next(error);
  }
});
export interface ISuperAdmin extends IUser {
  lastLogin?: Date;
}
const SuperAdminSchema = new Schema<ISuperAdmin>({
  lastLogin: { type: Date },
});
SuperAdminSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      next();
    } catch (error: any) {
      console.error("Error in SuperAdmin cascading delete:", error);
      next(error);
    }
  }
);
SuperAdminSchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDelete = await this.model.findOne(this.getFilter());
    if (docToDelete) {
      await docToDelete.deleteOne();
    }
    next();
  } catch (error: any) {
    next(error);
  }
});
export const Admin = User.discriminator<IAdmin>("admin", AdminSchema);
export const SuperAdmin = User.discriminator<ISuperAdmin>(
  "superAdmin",
  SuperAdminSchema
);
