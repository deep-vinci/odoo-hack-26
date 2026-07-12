import type { Response } from "express";

export const sendSuccess = <T>(res: Response, statusCode: number, data: T): Response =>
  res.status(statusCode).json({ success: true, data });
