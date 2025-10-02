import { NextFunction, Request, Response } from "express";
import { Announcement } from "../../../models/Announcement";
import { uploadImage } from "../../../utils/uploadImage";
import { uploadVideo } from "../../../utils/uploadVideo";
import { ApiError } from "../../../utils/ApiError";
import { Student, Teacher } from "../../../models/user";
import { Assignment } from "../../../models/assignment";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Chapter } from "../../../models/chapter";

export async function getAnnouncements(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, content, type, accentColor, isPinned = false } = req.body;
    let mediaUrl;

    if (req.file) {
      if (type === "image") {
        const result = await uploadImage(
          req.file.buffer,
          "announcements/images"
        );
        mediaUrl = result.secure_url;
      } else if (type === "video") {
        const result = await uploadVideo(
          req.file.buffer,
          "announcements/videos"
        );
        mediaUrl = result.secure_url;
      }
    }

    const payload = { title, content, type, mediaUrl, accentColor, isPinned };
    const announcement = await Announcement.create(payload);

    if (!announcement) throw new ApiError(400, "Failed to create announcement");

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: {
        _id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        createdAt: announcement.createdAt,
        accentColor: announcement.accentColor,
        mediaUrl: announcement.mediaUrl,
        isPinned: announcement.isPinned,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, content, type, accentColor, isPinned } = req.body;

    let mediaUrl = req.body.mediaUrl;
    if (req.file) {
      if (type === "image") {
        const result = await uploadImage(
          req.file.buffer,
          "announcements/images"
        );
        mediaUrl = result.secure_url;
      } else if (type === "video") {
        const result = await uploadVideo(
          req.file.buffer,
          "announcements/videos"
        );
        mediaUrl = result.secure_url;
      }
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, type, mediaUrl, accentColor, isPinned },
      { new: true }
    );

    if (!announcement) throw new ApiError(404, "Announcement not found");

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: {
        _id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        createdAt: announcement.createdAt,
        accentColor: announcement.accentColor,
        mediaUrl: announcement.mediaUrl,
        isPinned: announcement.isPinned,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);

    if (!deleted) throw new ApiError(404, "Announcement not found");

    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function togglePin(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
}

export async function getStudentDashboard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = new mongoose.Types.ObjectId(req.userId);

    const [chapterStats, assignmentStats, announcements] = await Promise.all([
      Chapter.aggregate([
        { $unwind: "$students" },
        { $match: { "students.student": studentId } },
        {
          $group: {
            _id: "$students.progress",
            count: { $sum: 1 },
          },
        },
      ]),
      Assignment.aggregate([
        { $unwind: "$submissions" },
        { $match: { "submissions.student": studentId } },
        {
          $group: {
            _id: "$submissions.status",
            count: { $sum: 1 },
          },
        },
      ]),
      Announcement.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      data: {
        chapterStats: chapterStats.map((c) => ({
          progress: c._id,
          count: c.count,
        })),
        assignmentStats: assignmentStats.map((a) => ({
          status: a._id,
          count: a.count,
        })),
        latestAnnouncements: announcements,
      },
    });
  } catch (err) {
    next(err);
  }
}
