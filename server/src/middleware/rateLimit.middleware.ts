import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError";

interface RateLimitOptions {
  max: number;
  windowMs: number;
  keyFn: (req: Request) => string;
  code?: string;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export const createRateLimiter = ({
  max,
  windowMs,
  keyFn,
  code = "RATE_LIMITED",
  message = "Too many requests. Try again later.",
}: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = keyFn(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      next(new ApiError(429, code, message));
      return;
    }

    bucket.count += 1;
    next();
  };
};
