import { Request, Response } from "express";
import { User } from "../../../models/user/User.model";
import { ChatRoom } from "../../../models/chat/Chat.model";
import { Message } from "../../../models/chat/Message.model";
export const getOrCreateDirectRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { otherUserId } = req.params;
    let room = await ChatRoom.findOne({
      roomType: "direct",
      "participants.userId": { $all: [userId, otherUserId] },
    })
      .populate("participants.userId", "name email role avatar")
      .populate("lastMessage.senderId", "name avatar");
    if (!room) {
      const [user, otherUser] = await Promise.all([
        User.findById(userId),
        User.findById(otherUserId),
      ]);
      if (!user || !otherUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      room = await ChatRoom.create({
        roomType: "direct",
        name: `${user.name} - ${otherUser.name}`,
        participants: [
          { userId, role: user.role, unreadCount: 0 },
          { userId: otherUserId, role: otherUser.role, unreadCount: 0 },
        ],
      });
      await room.populate("participants.userId", "name email role avatar");
    }
    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Error getting/creating direct room:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get chat room",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getOrCreateGradeRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { gradeId } = req.params;
    let room = await ChatRoom.findOne({
      roomType: "grade",
      gradeId,
      isActive: true,
    })
      .populate("participants.userId", "name email role avatar")
      .populate("gradeId", "grade section")
      .populate("lastMessage.senderId", "name avatar");
    if (!room) {
      const user = await User.findById(userId);
      const students = await User.find({
        gradeId,
        role: "student",
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      const participants = students.map((student) => ({
        userId: student._id,
        role: student.role,
        unreadCount: 0,
      }));
      participants.push({ 
        userId: user._id, 
        role: user.role,
        unreadCount: 0 
      });
      room = await ChatRoom.create({
        roomType: "grade",
        name: `Grade Room`,
        gradeId,
        participants,
      });
      await room.populate([
        { path: "participants.userId", select: "name email role avatar" },
        { path: "gradeId", select: "grade section" },
      ]);
    }
    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Error getting/creating grade room:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get chat room",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getMyRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rooms = await ChatRoom.find({
      "participants.userId": userId,
    })
      .populate("participants.userId", "name email role avatar")
      .populate("gradeId", "grade section")
      .populate("lastMessage.senderId", "name avatar")
      .sort({ "lastMessage.sentAt": -1, updatedAt: -1 });
    const roomsWithUnread = rooms.map((room:any) => {
      const participant = room.participants.find(
        (p: any) => p.userId._id.toString() === userId
      );
      return {
        ...room.toObject(),
        unreadCount: participant?.unreadCount || 0,
      };
    });
    return res.status(200).json({
      success: true,
      data: roomsWithUnread,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat rooms",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const updateLastRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { roomId } = req.params;
    const room = await ChatRoom.findOneAndUpdate(
      {
        _id: roomId,
        "participants.userId": userId,
      },
      {
        $set: {
          "participants.$.lastReadAt": new Date(),
          "participants.$.unreadCount": 0,
        },
      },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Last read updated",
      data: room,
    });
  } catch (error) {
    console.error("Error updating last read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update last read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const archiveRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { roomId } = req.params;
    const room = await ChatRoom.findOneAndUpdate(
      {
        _id: roomId,
        "participants.userId": userId,
      },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Room archived",
      data: room,
    });
  } catch (error) {
    console.error("Error archiving room:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to archive room",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const room = await ChatRoom.findOne({
      _id: roomId,
      "participants.userId": userId,
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found or access denied",
      });
    }
    let messageQuery: any = { isDeleted: false };
    if (room.roomType === "direct") {
      const otherParticipant = room.participants.find(
        (p: any) => p.userId.toString() !== userId
      );
      messageQuery = {
        messageType: "unicast",
        isDeleted: false,
        $or: [
          {
            senderId: userId,
            "recipients.userId": otherParticipant?.userId,
          },
          {
            senderId: otherParticipant?.userId,
            "recipients.userId": userId,
          },
        ],
      };
    } else if (room.roomType === "grade") {
      messageQuery = {
        messageType: "grade",
        gradeId: room.gradeId,
        isDeleted: false,
      };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find(messageQuery)
      .populate("senderId", "name email role avatar")
      .populate("gradeId", "grade section")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Message.countDocuments(messageQuery);
    return res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalMessages: total,
          hasMore: skip + messages.length < total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching room messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};