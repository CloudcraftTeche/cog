import { Router } from "express";
import { body, param, query } from "express-validator";
import { ChatController } from "../../../controllers/v1/chat";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";

const router = Router();
const chatController = new ChatController();

const createClassChatValidation = [
  body("gradeId").isMongoId().withMessage("Valid grade ID is required"),
  body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
];

const sendMessageValidation = [
  param("chatId").isMongoId().withMessage("Valid chat ID is required"),
  body("content").isString().trim().isLength({ min: 1, max: 1000 }),
  body("messageType")
    .optional()
    .isIn(["text", "image", "video", "pdf", "system"]),
  body("replyTo").optional().isMongoId(),
  body("attachments").optional().isArray(),
];

const createPrivateChatValidation = [
  body("recipientId").isMongoId().withMessage("Valid recipient ID is required"),
  body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
];

const moderateMessageValidation = [
  param("messageId").isMongoId().withMessage("Valid message ID is required"),
  body("action")
    .isIn(["approve", "reject", "flag"])
    .withMessage("Valid action is required"),
  body("reason").optional().isString().trim().isLength({ max: 500 }),
];


router.get("/", authenticate, chatController.getUserChats.bind(chatController));

router.get(
  "/:chatId/messages",
  authenticate,
  param("chatId").isMongoId(),
  chatController.getChatMessages.bind(chatController)
);

router.post(
  "/:chatId/messages",
  authenticate,
  sendMessageValidation,
  chatController.sendMessage.bind(chatController)
);

router.post(
  "/private",
  authenticate,
  createPrivateChatValidation,
  chatController.createPrivateChat.bind(chatController)
);

router.get(
  "/users/search",
  authenticate,
  query("query").isString().trim().isLength({ min: 1, max: 50 }),
  chatController.searchUsers.bind(chatController)
);

router.patch(
  "/:chatId/messages/:messageId/pin",
  authenticate,
  param("chatId").isMongoId(),
  param("messageId").isMongoId(),
  chatController.togglePinMessage.bind(chatController)
);



router.get(
  "/grades",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  chatController.getGrades.bind(chatController)
);

router.post(
  "/class",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  createClassChatValidation,
  chatController.createClassChat.bind(chatController)
);

router.patch(
  "/messages/:messageId/moderate",
  authenticate,
  authorizeRoles("admin", "superAdmin", "teacher"),
  moderateMessageValidation,
  chatController.moderateMessage.bind(chatController)
);

export default router;
