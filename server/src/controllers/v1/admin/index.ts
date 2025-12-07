import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../utils/ApiError";
import { Admin, IAdmin } from "../../../models/user/Admin.model";

export const createAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, gender } = req.body as IAdmin;

    const existing = await Admin.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
      gender,
      role: "admin",
    });

    if (!admin) {
      throw new ApiError(400, "Failed to create admin");
    }

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        gender: admin.gender,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<IAdmin>;

    const updated = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new ApiError(404, "Admin not found");
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
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

export const deleteAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Admin.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError(404, "Admin not found");
    }

    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAdminByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id).select("-password");
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

export const getAllAdminsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      Admin.find().skip(skip).limit(limit).select("-password"),
      Admin.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pageSize: admins.length,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};





