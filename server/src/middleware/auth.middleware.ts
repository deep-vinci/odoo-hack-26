import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";
import { rolesForRoute, type RouteKey } from "../constants/permissions";
import type { UserRole } from "../constants/roles";

const BEARER_PREFIX = "Bearer ";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(ApiError.unauthorized());
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized());
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden());
      return;
    }

    next();
  };

export const requirePermission = (routeKey: RouteKey) =>
  authorize(...rolesForRoute(routeKey));
