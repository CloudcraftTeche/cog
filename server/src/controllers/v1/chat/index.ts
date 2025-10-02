import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../../models/user";
import { Grade } from "../../../models/grade";
import { Chat } from "../../../models/chat";
import { Message } from "../../../models/message";
import {
  publishToQueue,
  QUEUE_NAMES,
} from "../../../services/rabbitmqServices";
import { AuthenticatedRequest } from "../../../middleware/authenticate";


export class ChatController {
  async createClassChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { gradeId, name } = req.body;
      const userId = req.user?.id;

      const user = await User.findById(userId);
      if (!user || !["admin", "superAdmin", "teacher"].includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Not authorized to create class chats" });
      }

      const grade = await Grade.findById(gradeId).populate([
        "students",
        "teachers",
      ]);
      if (!grade) {
        return res.status(404).json({ message: "Grade not found" });
      }

      const existingChat = await Chat.findOne({
        chatType: "class",
        class: grade.grade,
      });

      if (existingChat) {
        return res.status(400).json({ message: "Class chat already exists" });
      }

      const participants = [
        ...grade.students.map((s: any) => s._id),
        ...grade.teachers.map((t: any) => t._id),
      ];

      const chat = new Chat({
        name: name || `${grade.grade} Class Chat`,
        chatType: "class",
        class: grade.grade,
        participants,
        admins: grade.teachers.map((t: any) => t._id),
        moderators: grade.teachers.map((t: any) => t._id),
        requiresApproval: true,
        allowFileSharing: true,
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
        settings: {
          allowReactions: true,
          allowReplies: true,
          allowEditing: false,
          allowDeletion: false,
          muteNotifications: false,
        },
        createdBy: userId,
      });

      await chat.save();

      await publishToQueue(QUEUE_NAMES.CHAT_EVENTS, {
        type: "CHAT_CREATED",
        chatId: chat._id,
        chatType: "class",
        participants,
        createdBy: userId,
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Class chat created successfully",
        chat: await chat.populate(["participants", "admins", "moderators"]),
      });
    } catch (error) {
      console.error("Error creating class chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getGrades(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let grades;

      if (user.role === "admin" || user.role === "superAdmin") {
        grades = await Grade.find({}).populate(["students", "teachers"]);
      } else if (user.role === "teacher") {
        grades = await Grade.find({ teachers: userId }).populate([
          "students",
          "teachers",
        ]);
      } else {
        grades = await Grade.find({ students: userId }).populate([
          "students",
          "teachers",
        ]);
      }

      res.json({
        success: true,
        grades,
      });
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserChats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      const chats = await Chat.find({
        participants: userId,
        isActive: true,
      })
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "name profilePictureUrl",
          },
        })
        .populate("participants", "name profilePictureUrl role")
        .sort({ lastActivity: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      res.json({
        success: true,
        chats,
      });
    } catch (error) {
      console.error("Error fetching user chats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getChatMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;
      const { page = 1, limit = 50 } = req.query;

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this chat" });
      }

      const messages = await Message.find({
        chat: chatId,
        moderationStatus: { $in: ["approved", "pending"] },
      })
        .populate("sender", "name profilePictureUrl role")
        .populate("replyTo", "content sender")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: userId },
          "readBy.user": { $ne: userId },
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date(),
            },
          },
          status: "read",
        }
      );

      res.json({
        success: true,
        messages: messages.reverse(),
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { chatId } = req.params;
      const {
        content,
        messageType = "text",
        replyTo,
        attachments = [],
      } = req.body;
      const userId = req.user?.id;
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(new Types.ObjectId(userId))) {
        return res
          .status(403)
          .json({ message: "Not authorized to send messages to this chat" });
      }

      const message = new Message({
        sender: userId,
        chat: chatId,
        content,
        messageType,
        attachments,
        replyTo: replyTo || undefined,
        moderationStatus: chat.requiresApproval ? "pending" : "approved",
      });

      await message.save();

      chat.lastMessage = message._id;
      chat.lastActivity = new Date();
      await chat.save();

      await publishToQueue(QUEUE_NAMES.MESSAGE_EVENTS, {
        type: "MESSAGE_SENT",
        messageId: message._id,
        chatId,
        senderId: userId,
        content,
        messageType,
        timestamp: new Date(),
        participants: chat.participants,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profilePictureUrl role")
        .populate("replyTo", "content sender");

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async moderateMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const { action, reason } = req.body;
      const userId = req.user?.id;

      const message = await Message.findById(messageId).populate("chat");
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      const chat = message.chat as any;

      const user = await User.findById(userId);
      if (
        !user ||
        (!chat.moderators.includes(new Types.ObjectId(userId)) &&
          !["admin", "superAdmin"].includes(user.role))
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to moderate messages" });
      }

      message.moderationStatus =
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "flagged";
      message.moderatedBy = new Types.ObjectId(userId);
      message.moderationReason = reason;

      await message.save();

      await publishToQueue(QUEUE_NAMES.MODERATION_EVENTS, {
        type: "MESSAGE_MODERATED",
        messageId,
        action,
        moderatedBy: userId,
        reason,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: "Message moderated successfully",
      });
    } catch (error) {
      console.error("Error moderating message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async createPrivateChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { recipientId, name } = req.body;
      const userId = req.user?.id;

      if (userId === recipientId) {
        return res
          .status(400)
          .json({ message: "Cannot create chat with yourself" });
      }

      const existingChat = await Chat.findOne({
        chatType: "private",
        participants: { $all: [userId, recipientId], $size: 2 },
      });

      if (existingChat) {
        return res.json({
          success: true,
          chat: existingChat,
          message: "Private chat already exists",
        });
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      const chat = new Chat({
        name: name || `${req.user?.name} & ${recipient.name}`,
        chatType: "private",
        participants: [userId, recipientId],
        admins: [userId, recipientId],
        requiresApproval: false,
        allowFileSharing: true,
        settings: {
          allowReactions: true,
          allowReplies: true,
          allowEditing: true,
          allowDeletion: true,
          muteNotifications: false,
        },
        createdBy: userId,
      });

      await chat.save();

      await publishToQueue(QUEUE_NAMES.CHAT_EVENTS, {
        type: "PRIVATE_CHAT_CREATED",
        chatId: chat._id,
        participants: [userId, recipientId],
        createdBy: userId,
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        chat: await chat.populate(
          "participants",
          "name profilePictureUrl role"
        ),
      });
    } catch (error) {
      console.error("Error creating private chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async searchUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { query } = req.query;
      const userId = req.user?.id;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }

      const users = await User.find({
        _id: { $ne: userId },
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
        .select("name email profilePictureUrl role")
        .limit(10);

      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async togglePinMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;

      const message = await Message.findById(messageId).populate("chat");
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      const chat = message.chat as any;

      if (
        !chat.admins.includes(new Types.ObjectId(userId)) &&
        !chat.moderators.includes(new Types.ObjectId(userId))
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to pin messages" });
      }

      if (message.isPinned) {
        message.isPinned = false;
        message.pinnedBy = undefined;
        chat.pinnedMessages = chat.pinnedMessages.filter(
          (id: any) => !id.equals(new Types.ObjectId(messageId))
        );
      } else {
        message.isPinned = true;
        message.pinnedBy = new Types.ObjectId(userId);
        chat.pinnedMessages.push(new Types.ObjectId(messageId));
      }

      await Promise.all([message.save(), chat.save()]);

      res.json({
        success: true,
        message: message.isPinned ? "Message pinned" : "Message unpinned",
      });
    } catch (error) {
      console.error("Error toggling pin message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
