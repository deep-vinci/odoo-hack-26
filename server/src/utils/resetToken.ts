import crypto from "node:crypto";

export const generateRawToken = (): string =>
  crypto.randomBytes(32).toString("base64url");

export const hashToken = (raw: string): string =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const getResetTokenTtlMinutes = (): number => {
  const value = Number(process.env.RESET_TOKEN_TTL_MIN);
  return Number.isFinite(value) && value > 0 ? value : 30;
};
