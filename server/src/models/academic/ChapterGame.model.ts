import { model, Schema, Types } from "mongoose";
import { GAME_TYPES, GameType } from "../../utils/games/gameTypes";
// A game attached to a chapter. `config` is what students play with (answers removed
// before sending); `answerKey` never leaves the server for students. `key` is the id
// recorded in the chapter's studentProgress.activityProgress.
export type GameStatus = "draft" | "published" | "rejected";
export interface IChapterGame {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  gradeId: Types.ObjectId;
  key: string;
  type: GameType;
  title: string;
  instructions: string;
  order: number;
  config: any;
  answerKey?: any;
  status: GameStatus;
  source: "manual" | "ai";
  createdBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const ChapterGameSchema = new Schema<IChapterGame>(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: [true, "Chapter is required"],
      index: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
      index: true,
    },
    key: {
      type: String,
      required: [true, "Game key is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: { values: Object.keys(GAME_TYPES), message: "{VALUE} is not a supported game type" },
      required: [true, "Game type is required"],
    },
    title: {
      type: String,
      required: [true, "Game title is required"],
      trim: true,
    },
    instructions: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0, min: 0 },
    config: { type: Schema.Types.Mixed, required: [true, "Game config is required"] },
    answerKey: { type: Schema.Types.Mixed, select: false },
    status: {
      type: String,
      enum: ["draft", "published", "rejected"],
      default: "draft",
      index: true,
    },
    source: { type: String, enum: ["manual", "ai"], default: "manual" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);
ChapterGameSchema.index({ chapterId: 1, key: 1 }, { unique: true });
ChapterGameSchema.index({ chapterId: 1, status: 1, order: 1 });
export const ChapterGame = model<IChapterGame>("ChapterGame", ChapterGameSchema);
