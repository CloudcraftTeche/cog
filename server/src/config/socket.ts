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

    socket.on("join-user-room", (userId: string) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined room: ${userId}`);
    });

    socket.on("join-chats", (chatIds: string[]) => {
      chatIds.forEach((chatId) => socket.join(chatId));
      console.log(`User ${socket.id} joined chats:`, chatIds);
    });

    socket.on("query-created", async (data) => {
      try {
        socket.to(data.to).emit("new-query-notification", {
          queryId: data.queryId,
          from: data.from,
          subject: data.subject,
          priority: data.priority,
          queryType: data.queryType,
        });

        await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
          type: "QUERY_CREATED_REALTIME",
          ...data,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("Query creation socket error:", error);
        socket.emit("query-error", { error: "Failed to notify query creation" });
      }
    });

    socket.on("query-response", async (data) => {
      try {
        if (data.notifyUsers && data.notifyUsers.length > 0) {
          data.notifyUsers.forEach((userId: string) => {
            socket.to(userId).emit("query-response-notification", {
              queryId: data.queryId,
              responseFrom: data.responseFrom,
              responseContent: data.responseContent,
              subject: data.subject,
            });
          });
        }

        await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
          type: "QUERY_RESPONSE_REALTIME",
          ...data,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("Query response socket error:", error);
        socket.emit("query-error", { error: "Failed to notify query response" });
      }
    });

    socket.on("query-status-update", async (data) => {
      try {
        if (data.notifyUsers && data.notifyUsers.length > 0) {
          data.notifyUsers.forEach((userId: string) => {
            socket.to(userId).emit("query-status-notification", {
              queryId: data.queryId,
              status: data.status,
              updatedBy: data.updatedBy,
              subject: data.subject,
            });
          });
        }

        await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
          type: "QUERY_STATUS_UPDATE_REALTIME",
          ...data,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("Query status update socket error:", error);
        socket.emit("query-error", { error: "Failed to notify status update" });
      }
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

      socket.broadcast.emit("user-status-change", {
        userId,
        status: "online",
      });
    });

    socket.on("join-admin-room", () => {
      socket.join("admin-room");
      console.log(`Admin ${socket.id} joined admin room`);
    });

    socket.on("query-assignment", async (data) => {
      try {
        socket.to(data.assignedTo).emit("query-assigned", {
          queryId: data.queryId,
          assignedBy: data.assignedBy,
          subject: data.subject,
          priority: data.priority,
        });

        await publishToQueue(QUEUE_NAMES.NOTIFICATION_EVENTS, {
          type: "QUERY_ASSIGNED",
          ...data,
          socketId: socket.id,
        });
      } catch (error) {
        console.error("Query assignment socket error:", error);
        socket.emit("query-error", { error: "Failed to notify assignment" });
      }
    });

    socket.on("bulk-status-update", (data) => {
      socket.to("admin-room").emit("bulk-update-notification", {
        updatedCount: data.updatedCount,
        status: data.status,
        updatedBy: data.updatedBy,
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

  io.use((socket:any, next) => {
    socket.request.io = io;
    next();
  });

  return io;
};