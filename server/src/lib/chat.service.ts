import { Grade } from "../models/academic/Grade.model";
import { ChatRoom } from "../models/chat/Chat.model";
import { Message } from "../models/chat/Message.model";
import { Student } from "../models/user/Student.model";
import { Teacher } from "../models/user/Teacher.model";
import { User } from "../models/user/User.model";
import { Types } from "mongoose";
export class ChatService {
  static async getOrCreateDirectRoom(
    user1Id: Types.ObjectId,
    user2Id: Types.ObjectId
  ) {
    let chatRoom = await ChatRoom.findOne({
      roomType: "direct",
      "participants.userId": { $all: [user1Id, user2Id] },
    });
    if (!chatRoom) {
      const user1 = await User.findById(user1Id).select("role");
      const user2 = await User.findById(user2Id).select("role");
      chatRoom = await ChatRoom.create({
        roomType: "direct",
        name: `${user1?.role}-${user2?.role}`,
        participants: [
          { userId: user1Id, role: user1!.role },
          { userId: user2Id, role: user2!.role },
        ],
      });
    }
    return chatRoom;
  }
  static async getOrCreateGradeRoom(gradeId: Types.ObjectId) {
    let chatRoom = await ChatRoom.findOne({
      roomType: "grade",
      gradeId,
    });
    if (!chatRoom) {
      const students = await Student.find({ gradeId }).select("-password");
      const teachers = await Teacher.find({ gradeId }).select("-password");
      const grade = await Grade.findById(gradeId);
      if (!grade) {
        throw new Error("Grade not found");
      }
      const participants = [
        students?.map((student) => ({
          userId: student._id,
          role: "student" as const,
        })),
        teachers?.map((teacher) => ({
          userId: teacher._id,
          role: "teacher" as const,
        })),
      ];
      chatRoom = await ChatRoom.create({
        roomType: "grade",
        name: `Grade ${grade.grade}`,
        gradeId,
        participants,
      });
    }
    return chatRoom;
  }
  static async updateUnreadCount(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    increment: boolean = true
  ) {
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) return;
    const participant = chatRoom.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );
    if (participant) {
      if (increment) {
        participant.unreadCount += 1;
      } else {
        participant.unreadCount = 0;
        participant.lastReadAt = new Date();
      }
      await chatRoom.save();
    }
  }
  static async getUnreadMessages(userId: Types.ObjectId) {
    return await Message.find({
      "recipients.userId": userId,
      "recipients.status": { $ne: "read" },
      isDeleted: false,
    })
      .populate("senderId", "name email profilePictureUrl role")
      .populate("gradeId", "grade")
      .sort({ createdAt: -1 });
  }
  static async markConversationAsRead(
    userId: Types.ObjectId,
    otherUserId: Types.ObjectId
  ) {
    await Message.updateMany(
      {
        senderId: otherUserId,
        "recipients.userId": userId,
        "recipients.status": { $ne: "read" },
      },
      {
        $set: {
          "recipients.$.status": "read",
          "recipients.$.readAt": new Date(),
        },
      }
    );
  }
  static async getMessageStats(userId: Types.ObjectId) {
    const totalSent = await Message.countDocuments({
      senderId: userId,
      isDeleted: false,
    });
    const totalReceived = await Message.countDocuments({
      "recipients.userId": userId,
      isDeleted: false,
    });
    const unreadCount = await Message.countDocuments({
      "recipients.userId": userId,
      "recipients.status": { $ne: "read" },
      isDeleted: false,
    });
    return {
      totalSent,
      totalReceived,
      unreadCount,
    };
  }
  static async deleteOldMessages(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const result = await Message.updateMany(
      {
        createdAt: { $lt: cutoffDate },
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }
  static async searchMessages(
    userId: Types.ObjectId,
    searchQuery: string,
    options: {
      messageType?: string;
      gradeId?: Types.ObjectId;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const query: any = {
      isDeleted: false,
      $or: [{ senderId: userId }, { "recipients.userId": userId }],
      content: { $regex: searchQuery, $options: "i" },
    };
    if (options.messageType) {
      query.messageType = options.messageType;
    }
    if (options.gradeId) {
      query.gradeId = options.gradeId;
    }
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.createdAt.$lte = options.endDate;
      }
    }
    return await Message.find(query)
      .populate("senderId", "name email profilePictureUrl role")
      .populate("gradeId", "grade")
      .sort({ createdAt: -1 })
      .limit(100);
  }
}
