import { Router } from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
  getAnnouncementsForStudent,
  getAnnouncementById,
} from "../../../controllers/v1/announcement";
import { param, body, query } from "express-validator";
import mongoose from "mongoose";
import { uploadSingle } from "../../../middleware/upload";
const router = Router();
const oid = (field: string) => param(field).isMongoId().withMessage(`Invalid ${field}`);
router.get("/", [
  query("gradeId").optional().isMongoId().withMessage("Invalid gradeId")
], getAnnouncements);
router.get("/student", getAnnouncementsForStudent);
router.get("/:id", oid("id"), getAnnouncementById);
router.post("/",uploadSingle, [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("content").trim().notEmpty().withMessage("Content required"),
  body("type").optional().isIn(["text", "image", "video"]).withMessage("Invalid type"),
  body("targetAudience").optional().isIn(["all", "specific"]).withMessage("Invalid target audience"),
  body("targetGrades").optional().custom(val => {
    const arr = Array.isArray(val) ? val : JSON.parse(val || "[]");
    return arr.every((id: string) => mongoose.Types.ObjectId.isValid(id));
  }).withMessage("Invalid grade IDs"),
  body("accentColor").optional().trim(),
  body("isPinned").optional().isBoolean()
], createAnnouncement);
router.put("/:id",uploadSingle, [
  oid("id"),
  body("title").optional().trim().notEmpty(),
  body("content").optional().trim().notEmpty(),
  body("type").optional().isIn(["text", "image", "video"]),
  body("targetAudience").optional().isIn(["all", "specific"]),
  body("targetGrades").optional().custom(val => {
    const arr = Array.isArray(val) ? val : JSON.parse(val || "[]");
    return arr.every((id: string) => mongoose.Types.ObjectId.isValid(id));
  })
], updateAnnouncement);
router.delete("/:id", oid("id"), deleteAnnouncement);
router.patch("/:id/pin", [
  oid("id"),
  body("isPinned").optional().isBoolean()
], togglePin);
export default router;