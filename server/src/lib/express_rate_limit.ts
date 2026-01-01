import rateLimit from "express-rate-limit";
import { AuthenticatedRequest } from "../middleware/authenticate";
const expressRateLimit = rateLimit({
  windowMs: 60000,
  max: 100,
  message: "Too many requests, please try again later.",
  skipFailedRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
export default expressRateLimit;
export const messageRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    message: "Too many messages sent, please slow down",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => {
    return req.user?.id || req.ip;
  },
});
export const chatCreationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many chats created, please wait before creating more",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return req.user?.id || req.ip;
  },
});
export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Too many search requests, please wait",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => {
    return req.user?.id || req.ip;
  },
});
