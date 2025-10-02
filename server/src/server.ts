import express, { Request, Response, NextFunction } from "express";
import http from "http";
import config from "./config/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import expressRateLimit from "./lib/express_rate_limit";
import v1Routes from "./routes/v1/index";
import { connectToDatabase, disconnectFromDatabase } from "./lib/mongoose";
import { initializeSocket } from "./config/socket";
import rabbitmqService from "./services/rabbitmqServices";

// Express app
const app = express();
const server = http.createServer(app);

// CORS options
const corsOptions = {
  origin(origin: string | undefined, callback: Function) {
    if (!origin || config.NODE_ENV === "development" || config.whitelistOrigins?.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// Apply middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight requests

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  compression({
    level: 6,
    threshold: 2048,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(expressRateLimit);

// Routes
app.use("/api/v1", v1Routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Server init
(async () => {
  try {
    await connectToDatabase();
    await rabbitmqService.connect();
    initializeSocket(server);

    server.listen(config.PORT, () => {
      console.info(`🚀 Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
const gracefulShutdown = async () => {
  console.info("Shutdown signal received, closing gracefully");
  server.close(async () => {
    await disconnectFromDatabase();
    await rabbitmqService.close();
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
