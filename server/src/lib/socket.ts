import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user/User.model";
import { Grade } from "../models/academic/Grade.model";
interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}
interface JWTPayload {
  userId: string;
  role: string;
}
export const initializeSocketIO = (io: Server) => {
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        console.error("❌ No token provided in socket connection");
        return next(new Error("Authentication token required"));
      }
      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET not configured");
        return next(new Error("Server configuration error"));
      }
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET
      ) as JWTPayload;
      const user = await User.findById(decoded.userId).select(
        "name email role gradeId isActive"
      );
      if (!user) {
        console.error(`❌ User not found or inactive: ${decoded.userId}`);
        return next(new Error("User not found or inactive"));
      }
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      console.log(
        `✅ Socket authenticated: ${user.name} (${user.role}) - Socket ID: ${socket.id}`
      );
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("❌ JWT verification failed:", error.message);
        return next(new Error("Invalid authentication token"));
      }
      console.error("❌ Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });
  io.on("connection", async (socket: AuthSocket) => {
    try {
      console.log(`\n👤 User connected: ${socket.userId} (${socket.userRole})`);
      console.log(`🆔 Socket ID: ${socket.id}`);
      socket.join(`user-${socket.userId}`);
      console.log(`📍 Joined personal room: user-${socket.userId}`);
      if (["student", "teacher"].includes(socket.userRole!)) {
        const user = await User.findById(socket.userId).populate("gradeId");
        if (user && (user as any).gradeId) {
          const gradeId = (user as any).gradeId._id || (user as any).gradeId;
          socket.join(`grade-${gradeId}`);
          console.log(`📚 Joined grade room: grade-${gradeId}`);
        }
      }
      if (["admin", "superAdmin"].includes(socket.userRole!)) {
        const grades = await Grade.find({ isActive: true });
        for (const grade of grades) {
          socket.join(`grade-${grade._id}`);
        }
        console.log(`🔐 Admin joined ${grades.length} grade rooms`);
      }
      socket.broadcast.emit("user-status", {
        userId: socket.userId,
        status: "online",
        timestamp: new Date(),
      });
      socket.on(
        "typing",
        (data: { roomId: string; recipientId?: string; isTyping: boolean }) => {
          console.log(
            `⌨️  User ${socket.userId} typing in room ${data.roomId}`
          );
          if (data.recipientId) {
            socket.to(`user-${data.recipientId}`).emit("user-typing", {
              userId: socket.userId,
              isTyping: data.isTyping,
            });
          } else if (data.roomId) {
            socket.to(data.roomId).emit("user-typing", {
              userId: socket.userId,
              isTyping: data.isTyping,
            });
          }
        }
      );
      socket.on(
        "status-update",
        (data: { status: "online" | "offline" | "away" }) => {
          console.log(`📊 User ${socket.userId} status: ${data.status}`);
          io.emit("user-status", {
            userId: socket.userId,
            status: data.status,
            timestamp: new Date(),
          });
        }
      );
      socket.on(
        "message-delivered",
        (data: { messageId: string; roomId: string }) => {
          console.log(
            `✓ Message ${data.messageId} delivered to ${socket.userId}`
          );
          socket.broadcast.to(data.roomId).emit("delivery-confirmation", {
            messageId: data.messageId,
            userId: socket.userId,
            timestamp: new Date(),
          });
        }
      );
      socket.on(
        "message-read",
        (data: { messageId: string; roomId: string }) => {
          console.log(`✓✓ Message ${data.messageId} read by ${socket.userId}`);
          socket.broadcast.to(data.roomId).emit("read-confirmation", {
            messageId: data.messageId,
            userId: socket.userId,
            timestamp: new Date(),
          });
        }
      );
      socket.on("join-room", (data: { roomId: string }) => {
        socket.join(data.roomId);
        console.log(`📍 User ${socket.userId} joined room ${data.roomId}`);
        socket.emit("room-joined", { roomId: data.roomId });
      });
      socket.on("leave-room", (data: { roomId: string }) => {
        socket.leave(data.roomId);
        console.log(`📍 User ${socket.userId} left room ${data.roomId}`);
        socket.emit("room-left", { roomId: data.roomId });
      });
      socket.on("disconnect", (reason) => {
        console.log(`\n👋 User disconnected: ${socket.userId}`);
        console.log(`📊 Reason: ${reason}`);
        console.log(`🆔 Socket ID: ${socket.id}\n`);
        io.emit("user-status", {
          userId: socket.userId,
          status: "offline",
          timestamp: new Date(),
        });
      });
      socket.on("error", (error) => {
        console.error(`❌ Socket error for user ${socket.userId}:`, error);
      });
    } catch (error) {
      console.error("❌ Error in socket connection handler:", error);
      socket.disconnect(true);
    }
  });
  setInterval(() => {
    const sockets = io.sockets.sockets;
    const rooms = io.sockets.adapter.rooms;
    console.log(`\n📊 Socket Stats:`);
    console.log(`   Active connections: ${sockets.size}`);
    console.log(`   Active rooms: ${rooms.size}`);
  }, 300000);
  return io;
};
