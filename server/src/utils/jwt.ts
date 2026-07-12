import jwt, { type SignOptions } from "jsonwebtoken";

import type { UserRole } from "../constants/roles";

export interface JwtPayload {
  user_id: string;
  role: UserRole;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

export const getTokenExpiresInSeconds = (): number => {
  const value = Number(process.env.JWT_EXPIRES_IN);
  return Number.isFinite(value) && value > 0 ? value : 43200;
};

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: getTokenExpiresInSeconds() };
  return jwt.sign(payload, getSecret(), options);
};

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret()) as JwtPayload;
