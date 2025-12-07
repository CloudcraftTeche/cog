
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { Announcement } from "../../../models/announcement";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { uploadToCloudinary } from "../../../config/cloudinary";
import { Student } from "../../../models/user/Student.model";

export const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gradeId } = req.query;

    let filter: any = {};
    if (gradeId) {
      filter = {
        $or: [
          { targetAudience: "all" },
          { targetGrades: new mongoose.Types.ObjectId(gradeId as string) }
        ]
      };
    }

    const announcements = await Announcement.find(filter)
      .populate("targetGrades", "grade")
      .populate("createdBy", "name")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};

export const getAnnouncementById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("targetGrades", "grade")
      .populate("createdBy", "name")
      .lean();

    if (!announcement) throw new ApiError(404, "Announcement not found");

    res.json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title, content, type, accentColor,
      isPinned = false, targetAudience = "all", targetGrades = []
    } = req.body;

    let mediaUrl, mediaPublicId;

    if (req.file) {
      if (type === "image") {
        const result:any = await uploadToCloudinary(req.file.buffer, "announcements/images");
        mediaUrl = result.secure_url;
        mediaPublicId = result.public_id;
      } else if (type === "video") {
        const result:any = await uploadToCloudinary(req.file.buffer, "announcements/videos");
        mediaUrl = result.secure_url;
        mediaPublicId = result.public_id;
      }
    }

    const parsedGrades = Array.isArray(targetGrades)
      ? targetGrades
      : JSON.parse(targetGrades || "[]");

    const announcement = await Announcement.create({
      title,
      content,
      type,
      mediaUrl,
      mediaPublicId,
      accentColor,
      isPinned,
      targetAudience,
      targetGrades: targetAudience === "specific" ? parsedGrades : [],
      createdBy: req.userId,
    });

    if (!announcement) throw new ApiError(400, "Failed to create announcement");

    const populated = await Announcement.findById(announcement._id)
      .populate("targetGrades", "grade")
      .lean();

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title, content, type, accentColor, isPinned,
      targetAudience, targetGrades
    } = req.body;

    const existing = await Announcement.findById(id);
    if (!existing) throw new ApiError(404, "Announcement not found");

    let mediaUrl = req.body.mediaUrl || existing.mediaUrl;
    let mediaPublicId = existing.mediaPublicId;

    if (req.file) {
      if (type === "image") {
        const result:any = await uploadToCloudinary(req.file.buffer, "announcements/images");
        mediaUrl = result.secure_url;
        mediaPublicId = result.public_id;
      } else if (type === "video") {
        const result:any = await uploadToCloudinary(req.file.buffer, "announcements/videos");
        mediaUrl = result.secure_url;
        mediaPublicId = result.public_id;
      }
    }

    const parsedGrades = targetGrades
      ? (Array.isArray(targetGrades) ? targetGrades : JSON.parse(targetGrades || "[]"))
      : existing.targetGrades;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        content,
        type,
        mediaUrl,
        mediaPublicId,
        accentColor,
        isPinned,
        targetAudience,
        targetGrades: targetAudience === "specific" ? parsedGrades : [],
      },
      { new: true }
    ).populate("targetGrades", "grade").lean();

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, "Announcement not found");

    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const togglePin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) throw new ApiError(404, "Announcement not found");

    announcement.isPinned =
      typeof req.body.isPinned === "boolean"
        ? req.body.isPinned
        : !announcement.isPinned;

    await announcement.save();

    res.json({
      success: true,
      message: "Pin status updated successfully",
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

export const getAnnouncementsForStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const student = await Student.findById(req.userId).select("gradeId").lean();
    if (!student) throw new ApiError(404, "Student not found");

    const announcements = await Announcement.find({
      $or: [
        { targetAudience: "all" },
        { targetGrades: student.gradeId }
      ]
    })
      .populate("targetGrades", "grade")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};


