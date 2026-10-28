import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { AuthenticatedRequest } from "../../../middleware/authenticate";
import { Chapter } from "../../../models/academic/Chapter.model";
import { ChapterGame, IChapterGame } from "../../../models/academic/ChapterGame.model";
import { Teacher } from "../../../models/user/Teacher.model";
import { Student } from "../../../models/user/Student.model";
import { GAME_TYPES, GameAnswers, isGameType, scoreGame } from "../../../utils/games/gameTypes";

const assertStaffCanAccessGrade = async (req: AuthenticatedRequest, gradeId: Types.ObjectId) => {
  if (req.userRole !== "teacher") return;
  const teacher = await Teacher.findById(req.userId).select("gradeId");
  if (!teacher?.gradeId || !teacher.gradeId.equals(gradeId)) {
    throw new ApiError(403, "You can only manage games for your own grade");
  }
};

const assertStudentInGrade = async (req: AuthenticatedRequest, gradeId: Types.ObjectId) => {
  const student = await Student.findById(req.userId).select("gradeId");
  if (!student?.gradeId || !student.gradeId.equals(gradeId)) {
    throw new ApiError(404, "Game not found");
  }
};

const validateGame = (type: unknown, config: unknown, answerKey: unknown) => {
  if (!isGameType(type)) throw new ApiError(400, `Unsupported game type: ${type}`);
  const error = GAME_TYPES[type].validate(config, answerKey);
  if (error) throw new ApiError(400, error);
};

const findStaffGame = async (req: AuthenticatedRequest) => {
  const game = await ChapterGame.findById(req.params.id).select("+answerKey");
  if (!game) throw new ApiError(404, "Game not found");
  await assertStaffCanAccessGrade(req, game.gradeId);
  return game;
};

export const listChapterGamesHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chapter = await Chapter.findById(req.query.chapterId).select("gradeId");
    if (!chapter) throw new ApiError(404, "Chapter not found");
    await assertStaffCanAccessGrade(req, chapter.gradeId);
    const games = await ChapterGame.find({ chapterId: chapter._id }).select("+answerKey").sort({ order: 1, createdAt: 1 }).lean();
    res.status(200).json({ success: true, message: "Games fetched", data: games });
  } catch (error) {
    next(error);
  }
};

export const getChapterGameHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findStaffGame(req);
    res.status(200).json({ success: true, message: "Game fetched", data: game });
  } catch (error) {
    next(error);
  }
};

export const createChapterGameHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chapterId, type, title, instructions, order, config, answerKey, key, source } = req.body;
    const chapter = await Chapter.findById(chapterId).select("gradeId");
    if (!chapter) throw new ApiError(404, "Chapter not found");
    await assertStaffCanAccessGrade(req, chapter.gradeId);
    validateGame(type, config, answerKey);
    const gameId = new Types.ObjectId();
    const game = await ChapterGame.create({
      _id: gameId,
      chapterId: chapter._id,
      gradeId: chapter.gradeId,
      key: key || `game-${gameId.toString()}`,
      type,
      title,
      instructions,
      order: order ?? (await ChapterGame.countDocuments({ chapterId: chapter._id })),
      config,
      answerKey,
      source: source === "ai" ? "ai" : "manual",
      status: "draft",
      createdBy: req.userId,
    });
    res.status(201).json({ success: true, message: "Game created as draft", data: game });
  } catch (error) {
    next(error);
  }
};

export const updateChapterGameHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findStaffGame(req);
    const { title, instructions, order, config, answerKey } = req.body;
    const nextConfig = config ?? game.config;
    const nextAnswerKey = answerKey ?? game.answerKey;
    validateGame(game.type, nextConfig, nextAnswerKey);
    if (title !== undefined) game.title = title;
    if (instructions !== undefined) game.instructions = instructions;
    if (order !== undefined) game.order = order;
    game.config = nextConfig;
    game.answerKey = nextAnswerKey;
    game.markModified("config");
    game.markModified("answerKey");
    await game.save();
    res.status(200).json({ success: true, message: "Game updated", data: game });
  } catch (error) {
    next(error);
  }
};

export const setChapterGameStatusHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findStaffGame(req);
    game.status = req.body.status;
    game.reviewedBy = req.userId;
    game.reviewedAt = new Date();
    await game.save();
    res.status(200).json({ success: true, message: `Game ${game.status}`, data: game });
  } catch (error) {
    next(error);
  }
};

export const deleteChapterGameHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findStaffGame(req);
    await game.deleteOne();
    res.status(200).json({ success: true, message: "Game deleted", data: { _id: game._id } });
  } catch (error) {
    next(error);
  }
};

// Students: published games only, with every answer removed.
export const getPlayableGamesHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).select("gradeId studentProgress");
    if (!chapter) throw new ApiError(404, "Chapter not found");
    await assertStudentInGrade(req, chapter.gradeId);
    const games = await ChapterGame.find({ chapterId: chapter._id, status: "published" })
      .select("+answerKey")
      .sort({ order: 1, createdAt: 1 })
      .lean();
    const progress = chapter.studentProgress?.find((p) => p.studentId.toString() === String(req.userId));
    res.status(200).json({
      success: true,
      message: "Games fetched",
      data: games.map((game: IChapterGame) => {
        const done = progress?.activityProgress?.find((a) => a.activityId === game.key);
        return {
          _id: game._id,
          key: game.key,
          type: game.type,
          title: game.title,
          instructions: game.instructions,
          order: game.order,
          config: GAME_TYPES[game.type].toStudent(game.config, game.answerKey),
          result: done ? { score: done.score, total: done.total, completedAt: done.completedAt } : null,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

const findPlayableGame = async (req: AuthenticatedRequest) => {
  const game = await ChapterGame.findOne({ _id: req.params.id, status: "published" }).select("+answerKey");
  if (!game) throw new ApiError(404, "Game not found");
  await assertStudentInGrade(req, game.gradeId);
  return game;
};

// Instant feedback on one item (a word or a pair) while playing; nothing is saved.
export const checkGameAnswerHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findPlayableGame(req);
    const { itemId, answer } = req.body;
    const definition = GAME_TYPES[game.type];
    if (!definition.items(game.config).includes(itemId)) throw new ApiError(400, "Unknown item for this game");
    res.status(200).json({
      success: true,
      message: "Answer checked",
      data: {
        itemId,
        correct: definition.isCorrect(game.answerKey, itemId, String(answer), game.config),
        explanation: definition.explain?.(game.config, itemId) ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Finishing a game passes it; the chapter completes once every published game is finished.
export const submitGameHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await findPlayableGame(req);
    const answers = req.body.answers as GameAnswers;
    const result = scoreGame(game.type, game.config, game.answerKey, answers);
    if (!result.finished) throw new ApiError(400, "Answer every item to finish the game");

    const chapter = await Chapter.findById(game.chapterId);
    if (!chapter) throw new ApiError(404, "Chapter not found");
    // Finishing a game starts the chapter if the student had not started it yet; locked chapters stay locked.
    let progress = chapter.studentProgress?.find((p) => p.studentId.toString() === String(req.userId));
    if (progress?.status === "locked") throw new ApiError(403, "This chapter is locked");
    if (!progress) {
      chapter.studentProgress = chapter.studentProgress ?? [];
      chapter.studentProgress.push({ studentId: new Types.ObjectId(String(req.userId)), status: "in_progress", startedAt: new Date() } as any);
      progress = chapter.studentProgress[chapter.studentProgress.length - 1];
    } else if (progress.status === "accessible") {
      progress.status = "in_progress";
      progress.startedAt = progress.startedAt ?? new Date();
    }

    const activityProgress = progress.activityProgress ?? [];
    const previous = activityProgress.find((item) => item.activityId === game.key);
    if (previous) {
      previous.score = result.score;
      previous.total = result.total;
      previous.completedAt = new Date();
    } else {
      activityProgress.push({ activityId: game.key, score: result.score, total: result.total, completedAt: new Date() });
    }
    progress.activityProgress = activityProgress;

    const publishedKeys = (await ChapterGame.find({ chapterId: chapter._id, status: "published" }).select("key").lean()).map(
      (g) => g.key
    );
    const finishedGames = activityProgress.filter((item) => item.completedAt && publishedKeys.includes(item.activityId));
    const chapterCompleted = finishedGames.length >= publishedKeys.length;
    if (chapterCompleted && progress.status !== "completed") {
      progress.status = "completed";
      progress.completedAt = new Date();
      progress.score = Math.round(
        (finishedGames.reduce((sum, item) => sum + item.score, 0) / finishedGames.reduce((sum, item) => sum + item.total, 0)) * 100
      );
    }
    chapter.markModified("studentProgress");
    await chapter.save();

    res.status(200).json({
      success: true,
      message: chapterCompleted ? "Game finished; chapter completed" : "Game finished",
      data: {
        gameId: game._id,
        score: result.score,
        total: result.total,
        results: result.results.map(({ itemId, correct }) => ({ itemId, correct })),
        chapterCompleted,
        chapterStatus: progress.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
