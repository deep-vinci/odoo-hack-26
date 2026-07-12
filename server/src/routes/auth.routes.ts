import { Router } from "express";
import type { Request } from "express";

import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { createRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

const forgotPasswordLimiter = createRateLimiter({
  max: Number(process.env.RESET_RATE_LIMIT_MAX) || 3,
  windowMs: (Number(process.env.RESET_RATE_LIMIT_WINDOW_MIN) || 15) * 60_000,
  code: "RATE_LIMITED",
  message: "Too many reset requests. Try again later.",
  keyFn: (req: Request) => {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return email || req.ip || "unknown";
  },
});

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, changePassword);

export default router;
