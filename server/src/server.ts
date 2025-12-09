import express, { Application } from "express";
import http, { Server as HTTPServer } from "http";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { Server as SocketIOServer } from "socket.io";
import config from "./config/config";
import expressRateLimit from "./lib/express_rate_limit";
import v1Routes from "./routes/v1/index";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { connectToDatabase, disconnectFromDatabase } from "./lib/mongoose";
import { initializeSocketIO } from "./lib/socket";
let io: SocketIOServer;
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
const createApp = (): Application => {
  const app = express();
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      const isAllowed =
        config.NODE_ENV === "development" ||
        !origin ||
        config.whitelistOrigins?.includes(origin);
      callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
    },
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression({ level: 6, threshold: 2048 }));
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  app.use(expressRateLimit);
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.use("/api/v1", v1Routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
const createShutdownHandler = (
  server: HTTPServer,
  socketServer: SocketIOServer
) => {
  let isShuttingDown = false;
  return async (signal: string): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.info(`\n${signal} received, starting graceful shutdown...`);
    const forceExitTimeout = setTimeout(() => {
      console.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 30_000);
    try {
      console.info("Closing Socket.IO connections...");
      socketServer.close(() => {
        console.info("Socket.IO server closed");
      });
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      console.info("HTTP server closed");
      await disconnectFromDatabase();
      console.info("MongoDB disconnected");
      clearTimeout(forceExitTimeout);
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  };
};
const bootstrap = async (): Promise<void> => {
  try {
    console.info("🔄 Connecting to MongoDB...");
    await connectToDatabase();
    const app = createApp();
    const server = http.createServer(app);
    io = new SocketIOServer(server, {
      cors: {
        origin:
          config.NODE_ENV === "development"
            ? ["http://localhost:3000"]
            : config.whitelistOrigins || [],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      allowUpgrades: true,
      maxHttpBufferSize: 1e6,
      cookie: false,
    });
    initializeSocketIO(io);
    console.info("✅ Socket.IO initialized");
    server.listen(config.PORT, () => {
      console.info(`🚀 Server running on port ${config.PORT}`);
      console.info(`📍 Environment: ${config.NODE_ENV}`);
      console.info(`🔌 Socket.IO ready for connections`);
    });
    const shutdown = createShutdownHandler(server, io);
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      shutdown("UNCAUGHT_EXCEPTION");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
export { io };
bootstrap();
