import { Grade } from "../../../models/grade";
import { Unit } from "../../../models/unit";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import {ApiError} from "../../../utils/ApiError";

export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { unit } = req.body;

    if (!unit || typeof unit !== "string") {
      throw new ApiError(400, "Invalid unit");
    }

    const existing = await Unit.findOne({ unit: unit.trim() });
    if (existing) {
      throw new ApiError(409, "Unit already exists");
    }

    const newUnit = await Unit.create({ unit: unit.trim() });

    await Grade.updateMany(
      { units: { $ne: newUnit._id } },
      { $addToSet: { units: newUnit._id } }
    );

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: newUnit,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q.trim()) {
      filter.$or = [{ unit: { $regex: q.trim(), $options: "i" } }];
    }

    const [total, data] = await Promise.all([
      Unit.countDocuments(filter),
      Unit.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      message: "Units fetched",
      meta: { total, totalPages, page, limit },
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const unit = await Unit.findById(id).lean();
    if (!unit) {
      throw new ApiError(404, "Unit not found");
    }

    res.status(200).json({ success: true, message: "Unit fetched", data: unit });
  } catch (err) {
    next(err);
  }
};

export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { unit } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }
    if (!unit || typeof unit !== "string") {
      throw new ApiError(400, "Invalid unit value");
    }

    const existing = await Unit.findOne({ unit: unit.trim(), _id: { $ne: id } });
    if (existing) {
      throw new ApiError(409, "Another unit with the same value already exists");
    }

    const updated = await Unit.findByIdAndUpdate(
      id,
      { unit: unit.trim() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new ApiError(404, "Unit not found");
    }

    res.status(200).json({ success: true, message: "Unit updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const deleted = await Unit.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new ApiError(404, "Unit not found");
    }

    await Grade.updateMany({}, { $pull: { units: id } });

    res.status(200).json({ success: true, message: "Unit deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAllUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, data] = await Promise.all([
      Unit.countDocuments(),
      Unit.find().lean(),
    ]);

    res.status(200).json({
      success: true,
      message: "Units fetched",
      meta: { total },
      data,
    });
  } catch (err) {
    next(err);
  }
};





