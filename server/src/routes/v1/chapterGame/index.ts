import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  listChapterGamesHandler,
  getChapterGameHandler,
  createChapterGameHandler,
  updateChapterGameHandler,
  setChapterGameStatusHandler,
  deleteChapterGameHandler,
  getPlayableGamesHandler,
  checkGameAnswerHandler,
  submitGameHandler,
  reorderChapterGamesHandler,
  approveChapterDraftsHandler,
  previewGameHandler,
  previewCheckHandler,
  previewSubmitHandler,
} from "../../../controllers/v1/chapterGame";
import { authenticate } from "../../../middleware/authenticate";
import { authorizeRoles } from "../../../middleware/authorizeRoles";
import { validate } from "../../../middleware/validate";
import { GAME_TYPES } from "../../../utils/games/gameTypes";
const router = Router();
const STAFF = ["admin", "superAdmin", "teacher"];
const gameIdParam = param("id").isMongoId().withMessage("Invalid game ID");
router.get(
  "/chapter/:chapterId/play",
  authenticate,
  authorizeRoles("student"),
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  validate,
  getPlayableGamesHandler
);
router.post(
  "/:id/check",
  authenticate,
  authorizeRoles("student"),
  [
    gameIdParam,
    body("itemId").isString().notEmpty().withMessage("itemId is required"),
    body("answer").isString().withMessage("answer must be a string"),
  ],
  validate,
  checkGameAnswerHandler
);
router.post(
  "/:id/submit",
  authenticate,
  authorizeRoles("student"),
  [gameIdParam, body("answers").isObject().withMessage("answers must be an object of itemId to answer")],
  validate,
  submitGameHandler
);
router.get(
  "/",
  authenticate,
  authorizeRoles(...STAFF),
  [query("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  validate,
  listChapterGamesHandler
);
router.get("/:id", authenticate, authorizeRoles(...STAFF), [gameIdParam], validate, getChapterGameHandler);
router.post(
  "/",
  authenticate,
  authorizeRoles(...STAFF),
  [
    body("chapterId").isMongoId().withMessage("Invalid chapter ID"),
    body("type").isIn(Object.keys(GAME_TYPES)).withMessage("Unsupported game type"),
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
    body("instructions").optional().trim().isLength({ max: 500 }),
    body("order").optional().isInt({ min: 0 }).toInt(),
    body("config").isObject().withMessage("config is required"),
    body("answerKey").optional().isObject(),
    body("key").optional().trim().matches(/^[a-z0-9-]+$/).withMessage("key may only use lowercase letters, numbers and dashes"),
    body("source").optional().isIn(["manual", "ai"]),
  ],
  validate,
  createChapterGameHandler
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles(...STAFF),
  [
    gameIdParam,
    body("title").optional().trim().notEmpty().isLength({ max: 120 }),
    body("instructions").optional().trim().isLength({ max: 500 }),
    body("order").optional().isInt({ min: 0 }).toInt(),
    body("config").optional().isObject(),
    body("answerKey").optional().isObject(),
  ],
  validate,
  updateChapterGameHandler
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(...STAFF),
  [gameIdParam, body("status").isIn(["draft", "published", "rejected"]).withMessage("Invalid status")],
  validate,
  setChapterGameStatusHandler
);
router.patch(
  "/chapter/:chapterId/approve-drafts",
  authenticate,
  authorizeRoles(...STAFF),
  [param("chapterId").isMongoId().withMessage("Invalid chapter ID")],
  validate,
  approveChapterDraftsHandler
);
router.patch(
  "/chapter/:chapterId/order",
  authenticate,
  authorizeRoles(...STAFF),
  [
    param("chapterId").isMongoId().withMessage("Invalid chapter ID"),
    body("ids").isArray({ min: 1 }).withMessage("ids must list the chapter's games"),
    body("ids.*").isMongoId().withMessage("Invalid game ID"),
  ],
  validate,
  reorderChapterGamesHandler
);
router.get("/:id/preview", authenticate, authorizeRoles(...STAFF), [gameIdParam], validate, previewGameHandler);
router.post(
  "/:id/preview/check",
  authenticate,
  authorizeRoles(...STAFF),
  [
    gameIdParam,
    body("itemId").isString().notEmpty().withMessage("itemId is required"),
    body("answer").isString().withMessage("answer must be a string"),
  ],
  validate,
  previewCheckHandler
);
router.post(
  "/:id/preview/submit",
  authenticate,
  authorizeRoles(...STAFF),
  [gameIdParam, body("answers").isObject().withMessage("answers must be an object of itemId to answer")],
  validate,
  previewSubmitHandler
);
router.delete("/:id", authenticate, authorizeRoles(...STAFF), [gameIdParam], validate, deleteChapterGameHandler);
export default router;
