import { Request, Response } from "express";
import { Message } from "../../../models/chat/Message.model";
import { User } from "../../../models/user/User.model";
import { getIO } from "../../../server";
import { ChatRoom } from "../../../models/chat/Chat.model";
const updateRoomLastMessage = async (
  roomType: "unicast" | "grade" | "broadcast",
  content: string,
  senderId: string,
  recipientId?: string,
  gradeId?: string
) => {
  try {
    let query: any = { isActive: true };
    if (roomType === "unicast" && recipientId) {
      query = {
        roomType: "direct",
        isActive: true,
        "participants.userId": { $all: [senderId, recipientId] },
      };
    } else if (roomType === "grade" && gradeId) {
      query = {
        roomType: "grade",
        gradeId,
        isActive: true,
      };
    }
    await ChatRoom.findOneAndUpdate(
      query,
      {
        lastMessage: {
          content,
          senderId,
          sentAt: new Date(),
        },
        $inc: {
          "participants.$[elem].unreadCount": 1,
        },
      },
      {
        arrayFilters: [{ "elem.userId": { $ne: senderId } }],
      }
    );
  } catch (error) {
    console.error("Error updating room last message:", error);
  }
};
export const sendUnicastMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { recipientId, content } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID and content are required",
      });
    }
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }
    const message = await Message.create({
      senderId,
      senderRole: sender.role,
      recipients: [
        {
          userId: recipientId,
          role: recipient.role,
          status: "sent",
        },
      ],
      content,
      messageType: "unicast",
    });
    await message.populate([
      { path: "senderId", select: "name email role profilePictureUrl" },
    ]);
    const messageWithRecipient = message.toObject() as any;
    messageWithRecipient.recipientId = {
      _id: recipient._id,
      name: recipient.name,
      email: recipient.email,
      role: recipient.role,
      avatar: recipient.profilePictureUrl || null,
    };
    console.log("💬 Unicast message created:", message._id);
    await updateRoomLastMessage("unicast", content, senderId, recipientId);
    try {
      const io = getIO();
      io.to(`user-${recipientId}`).emit("new-message", messageWithRecipient);
      console.log(`📤 Message emitted to user-${recipientId}`);
      io.to(`user-${senderId}`).emit("new-message", messageWithRecipient);
      console.log(`📤 Message emitted to user-${senderId}`);
      io.to(`user-${recipientId}`).emit("room-updated", {
        type: "new-message",
        lastMessage: {
          content,
          senderId: sender._id,
          sentAt: new Date(),
        },
      });
    } catch (socketError) {
      console.error("❌ Socket.IO emission error:", socketError);
    }
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageWithRecipient,
    });
  } catch (error) {
    console.error("Error sending unicast message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const sendGradeMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { gradeId, content } = req.body;
    if (!gradeId || !content) {
      return res.status(400).json({
        success: false,
        message: "Grade ID and content are required",
      });
    }
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }
    const students = await User.find({
      gradeId: gradeId,
      role: "student",
    }).select("_id role");
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No  students found in this grade",
      });
    }
    const recipients = students.map((student) => ({
      userId: student._id,
      role: student.role,
      status: "sent" as const,
    }));
    const message = await Message.create({
      senderId,
      senderRole: sender.role,
      gradeId,
      recipients,
      content,
      messageType: "grade",
    });
    await message.populate([
      { path: "senderId", select: "name email role profilePictureUrl" },
      { path: "gradeId", select: "grade section" },
    ]);
    console.log("📢 Grade message created:", message._id);
    console.log(`📊 Broadcasting to ${recipients.length} students`);
    await updateRoomLastMessage("grade", content, senderId, undefined, gradeId);
    try {
      const io = getIO();
      io.to(`grade-${gradeId}`).emit("new-message", message);
      console.log(`📤 Message broadcast to grade-${gradeId}`);
      io.to(`grade-${gradeId}`).emit("room-updated", {
        type: "new-message",
        gradeId,
        lastMessage: {
          content,
          senderId: sender._id,
          sentAt: new Date(),
        },
      });
    } catch (socketError) {
      console.error("❌ Socket.IO emission error:", socketError);
    }
    return res.status(201).json({
      success: true,
      message: "Grade message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending grade message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send grade message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const sendBroadcastMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }
    if (sender.role !== "admin" && sender.role !== "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can send broadcast messages",
      });
    }
    const allUsers = await User.find().select("_id role");
    const recipients = allUsers
      .filter((user) => user._id.toString() !== senderId)
      .map((user) => ({
        userId: user._id,
        role: user.role,
        status: "sent" as const,
      }));
    const message = await Message.create({
      senderId,
      senderRole: sender.role,
      recipients,
      content,
      messageType: "broadcast",
    });
    await message.populate([
      { path: "senderId", select: "name email role profilePictureUrl" },
    ]);
    console.log("📣 Broadcast message created:", message._id);
    console.log(`📊 Broadcasting to ${recipients.length} users`);
    try {
      const io = getIO();
      io.emit("new-message", message);
      console.log("📤 Message broadcast to all users");
    } catch (socketError) {
      console.error("❌ Socket.IO emission error:", socketError);
    }
    return res.status(201).json({
      success: true,
      message: "Broadcast message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send broadcast message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { otherUserId } = req.params;
    const messages = await Message.find({
      messageType: "unicast",
      $or: [
        {
          senderId: userId,
          "recipients.userId": otherUserId,
        },
        {
          senderId: otherUserId,
          "recipients.userId": userId,
        },
      ],
    })
      .populate("senderId", "name email role profilePictureUrl")
      .sort({ createdAt: 1 });
    const otherUser = await User.findById(otherUserId).select(
      "name email role profilePictureUrl"
    );
    const messagesWithRecipient = messages.map((msg) => {
      const msgObj = msg.toObject() as any;
      msgObj.recipientId = otherUser;
      return msgObj;
    });
    await Message.updateMany(
      {
        senderId: otherUserId,
        "recipients.userId": userId,
        "recipients.status": { $ne: "read" },
      },
      {
        $set: {
          "recipients.$[elem].status": "read",
          "recipients.$[elem].readAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
      }
    );
    await ChatRoom.findOneAndUpdate(
      {
        roomType: "direct",
        "participants.userId": { $all: [userId, otherUserId] },
      },
      {
        $set: {
          "participants.$[elem].lastReadAt": new Date(),
          "participants.$[elem].unreadCount": 0,
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
      }
    );
    return res.status(200).json({
      success: true,
      data: messagesWithRecipient,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getGradeMessages = async (req: Request, res: Response) => {
  try {
    const { gradeId } = req.params;
    const userId = (req as any).user.id;
    const messages = await Message.find({
      messageType: "grade",
      gradeId,
    })
      .populate("senderId", "name email role profilePictureUrl")
      .populate("gradeId", "grade section")
      .sort({ createdAt: 1 });
    await ChatRoom.findOneAndUpdate(
      {
        roomType: "grade",
        gradeId,
        "participants.userId": userId,
      },
      {
        $set: {
          "participants.$[elem].lastReadAt": new Date(),
          "participants.$[elem].unreadCount": 0,
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
      }
    );
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching grade messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch grade messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const unreadCount = await Message.countDocuments({
      "recipients.userId": userId,
      "recipients.status": { $ne: "read" },
    });
    return res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { senderId } = req.body;
    await Message.updateMany(
      {
        senderId,
        "recipients.userId": userId,
        "recipients.status": { $ne: "read" },
      },
      {
        $set: {
          "recipients.$[elem].status": "read",
          "recipients.$[elem].readAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "elem.userId": userId }],
      }
    );
    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};