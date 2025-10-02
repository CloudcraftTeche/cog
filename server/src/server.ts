import express from "express";
import config from "./config/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import expressRateLimit from "./lib/express_rate_limit";
import { errorHandler } from "./middleware/errorHandler";
import http from "http";
//types
import type { CorsOptions } from "cors";

// express app
const app = express();
const server = http.createServer(app);

// importing routes
import v1Routes from "./routes/v1/index";
import { connectToDatabase, disconnectFromDatabase } from "./lib/mongoose";
import { initializeSocket } from "./config/socket";
import rabbitmqService from "./services/rabbitmqServices";

//configuring CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config?.whitelistOrigins?.includes(origin)
    ) {
      {
        callback(null, true);
      }
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
// appllying CORS middleware
app.use(cors(corsOptions));

// using cookie parser
app.use(cookieParser());

// using helmet for security
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// using compression for performance
app.use(
  compression({
    level: 6,
    threshold: 2048,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// applying rate limiting
app.use(expressRateLimit);

// global error handler
app.use(errorHandler);

// Global error handler
app.use((error: any, res: express.Response) => {
  console.error("Global error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

(async () => {
  try {
    await connectToDatabase();
    await rabbitmqService.connect();
    initializeSocket(server);
    app.use("/api/v1", v1Routes);

    server.listen(config.PORT, () => {
      console.info(`🚀 Server running on port ${config.PORT}`);
      console.info(`📡 Socket.IO server initialized`);
      console.info(`🐰 RabbitMQ connected`);
      console.info(`📊 MongoDB connected`);
    });
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.info("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectFromDatabase();
    await rabbitmqService.close();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.info("SIGINT received, shutting down gracefully");
  server.close(async () => {
    await disconnectFromDatabase();
    await rabbitmqService.close();
    process.exit(0);
  });
});
