import { Server as SocketIOServer } from "socket.io";
import { publishToQueue, QUEUE_NAMES } from "../services/rabbitmqServices";

export const initializeSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-chats", (chatIds: string[]) => {
      chatIds.forEach((chatId) => socket.join(chatId));
      console.log(`User ${socket.id} joined chats:`, chatIds);
    });

    socket.on("send-message", async (data) => {
      try {
        socket.to(data.chatId).emit("new-message", data);

        await publishToQueue(QUEUE_NAMES.MESSAGE_EVENTS, {
          type: "REALTIME_MESSAGE",
          ...data,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("Socket message error:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    socket.on("typing-start", (data) => {
      socket.to(data.chatId).emit("user-typing", {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on("typing-stop", (data) => {
      socket.to(data.chatId).emit("user-stopped-typing", {
        userId: data.userId,
      });
    });

    socket.on("user-online", async (userId: string) => {
      await publishToQueue(QUEUE_NAMES.USER_STATUS_EVENTS, {
        type: "USER_ONLINE",
        userId,
        socketId: socket.id,
      });
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      await publishToQueue(QUEUE_NAMES.USER_STATUS_EVENTS, {
        type: "USER_OFFLINE",
        socketId: socket.id,
      });
    });
  });

  return io;
};
