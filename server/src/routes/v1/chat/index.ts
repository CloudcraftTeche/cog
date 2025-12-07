import express from "express";
import {
  sendUnicastMessage,
  sendGradeMessage,
  sendBroadcastMessage,
  getConversation,
  getGradeMessages,
  getUnreadCount,
  markAsRead,
} from "../../../controllers/v1/chat";
import { authenticate } from "../../../middleware/authenticate";
const router = express.Router();
router.use(authenticate);
router.post("/unicast", sendUnicastMessage);
router.post("/grade", sendGradeMessage);
router.post("/broadcast", sendBroadcastMessage);
router.get("/conversation/:otherUserId", getConversation);
router.get("/grade/:gradeId", getGradeMessages);
router.get("/unread-count", getUnreadCount);
router.post("/mark-read", markAsRead);
export default router;
