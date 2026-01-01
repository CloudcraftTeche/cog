import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../utils/ApiError";
import { ISuperAdmin, SuperAdmin } from "../../../models/user/Admin.model";
export const createSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, gender } = req.body as ISuperAdmin;
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      password,
      phone,
      gender,
      role: "superAdmin",
    });
    if (!superAdmin) {
      throw new ApiError(400, "Failed to create super admin");
    }
    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        gender: superAdmin.gender,
        role: superAdmin.role,
        createdAt: superAdmin.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const updateSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<ISuperAdmin>;
    const updated = await SuperAdmin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      throw new ApiError(404, "Super admin not found");
    }
    res.status(200).json({
      success: true,
      message: "Super admin updated successfully",
      data: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        gender: updated.gender,
        role: updated.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const deleteSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await SuperAdmin.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, "Super admin not found");
    }
    res
      .status(200)
      .json({ success: true, message: "Super admin deleted successfully" });
  } catch (err) {
    next(err);
  }
};
export const getSuperAdminByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const superAdmin = await SuperAdmin.findById(id).select("-password");
    if (!superAdmin) {
      throw new ApiError(404, "Super admin not found");
    }
    res.status(200).json({ success: true, data: superAdmin });
  } catch (err) {
    next(err);
  }
};
export const getAllSuperAdminsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [superAdmins, total] = await Promise.all([
      SuperAdmin.find().skip(skip).limit(limit).select("-password"),
      SuperAdmin.countDocuments(),
    ]);
    const response = {
      success: true,
      total,
      page,
      pageSize: superAdmins.length,
      data: superAdmins,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
