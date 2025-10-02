
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", 
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err:any) => {
  console.error("❌ Redis connection error:", err);
});

(async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();
