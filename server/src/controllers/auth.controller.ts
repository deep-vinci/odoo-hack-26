import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateRefreshToken,
  validateRegister,
  validateResetPassword,
} from "../validators/auth.validator";
import {
  changePassword as changePasswordService,
  getUserById,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = validateRegister(req.body);
  const user = await registerUser(input);
  sendSuccess(res, 201, { user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = validateLogin(req.body);
  const result = await loginUser(input);
  sendSuccess(res, 200, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const input = validateRefreshToken(req.body);
  const result = await refreshSession(input.refresh_token);
  sendSuccess(res, 200, result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await getUserById(req.user.user_id);
  sendSuccess(res, 200, { user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    typeof req.body?.refresh_token === "string" ? req.body.refresh_token.trim() : "";
  if (refreshToken) {
    await logoutUser(refreshToken);
  }
  sendSuccess(res, 200, { message: "Logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = validateForgotPassword(req.body);
  const result = await requestPasswordReset(input);

  const data: { message: string; dev_reset_url?: string } = {
    message: "If an account exists for that email, a reset link has been sent.",
  };
  if (process.env.NODE_ENV !== "production" && result.devResetUrl) {
    data.dev_reset_url = result.devResetUrl;
  }

  sendSuccess(res, 200, data);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = validateResetPassword(req.body);
  await resetPasswordService(input);
  sendSuccess(res, 200, {
    message: "Password has been reset. You can now log in with your new password.",
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateChangePassword(req.body);
  await changePasswordService(req.user.user_id, input);
  sendSuccess(res, 200, { message: "Password updated successfully" });
});
