import express from "express";
import {
  getOrCreateDirectRoom,
  getOrCreateGradeRoom,
  getMyRooms,
  updateLastRead,
  archiveRoom,
  getRoomMessages,
} from "../../../controllers/v1/chat/chatroom";
import { authenticate } from "../../../middleware/authenticate";
const router = express.Router();
router.use(authenticate);
router.get("/my-rooms", getMyRooms);
router.get("/direct/:otherUserId", getOrCreateDirectRoom);
router.get("/grade/:gradeId", getOrCreateGradeRoom);
router.get("/:roomId/messages", getRoomMessages);
router.put("/:roomId/read", updateLastRead);
router.delete("/:roomId", archiveRoom);
export default router;