import { Schema } from "mongoose";
import { User, IUser } from "./User.model";

export interface IAdmin extends IUser {
  permissions?: string[];
}

const AdminSchema = new Schema<IAdmin>({
  permissions: [{
    type: String,
    enum: ["manage_users", "manage_grades", "view_reports", "manage_content"],
  }],
});

export interface ISuperAdmin extends IUser {
  lastLogin?: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>({
  lastLogin: { type: Date },
});

export const Admin = User.discriminator<IAdmin>("admin", AdminSchema);
export const SuperAdmin = User.discriminator<ISuperAdmin>("superAdmin", SuperAdminSchema);