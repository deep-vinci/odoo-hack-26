import crypto from "node:crypto";

export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("base64url");

export const hashRefreshToken = (raw: string): string =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const getRefreshTokenTtlDays = (): number => {
  const value = Number(process.env.REFRESH_TOKEN_TTL_DAYS);
  return Number.isFinite(value) && value > 0 ? value : 30;
};
