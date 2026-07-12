import bcrypt from "bcrypt";

import pool from "../config/db";
import { ApiError } from "../utils/ApiError";
import { signToken, getTokenExpiresInSeconds } from "../utils/jwt";
import {
  generateRawToken,
  hashToken,
  getResetTokenTtlMinutes,
} from "../utils/resetToken";
import { sendResetEmail } from "../config/mailer";
import type { UserRole } from "../constants/roles";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

const SALT_ROUNDS = 10;
const PG_UNIQUE_VIOLATION = "23505";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  token: string;
  expires_in: number;
  user: AuthUser;
}

export const registerUser = async (input: RegisterInput): Promise<UserRecord> => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    input.email,
  ]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw ApiError.conflict(
      "EMAIL_ALREADY_EXISTS",
      "A user with this email already exists",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [input.name, input.email, passwordHash, input.role],
    );
    return result.rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      throw ApiError.conflict(
        "EMAIL_ALREADY_EXISTS",
        "A user with this email already exists",
      );
    }
    throw err;
  }
};

export const getUserById = async (id: string): Promise<UserRecord> => {
  const result = await pool.query<UserRecord>(
    `SELECT id, name, email, role, is_active, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  const user = result.rows[0];
  if (!user) {
    throw ApiError.unauthorized();
  }

  return user;
};

interface UserAuthRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password_hash: string;
}

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const result = await pool.query<UserAuthRow>(
    `SELECT id, name, email, role, is_active, password_hash
     FROM users
     WHERE email = $1`,
    [input.email],
  );

  const user = result.rows[0];

  const passwordMatches = user
    ? await bcrypt.compare(input.password, user.password_hash)
    : false;

  if (!user || !passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.is_active) {
    throw new ApiError(403, "ACCOUNT_DISABLED", "This account has been deactivated");
  }

  const token = signToken({ user_id: user.id, role: user.role });

  return {
    token,
    expires_in: getTokenExpiresInSeconds(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export interface ForgotPasswordResult {
  devResetUrl?: string;
}

export const requestPasswordReset = async (
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> => {
  const result = await pool.query<{ id: string; is_active: boolean }>(
    "SELECT id, is_active FROM users WHERE email = $1",
    [input.email],
  );
  const user = result.rows[0];

  if (!user || !user.is_active) {
    return {};
  }

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const ttlMinutes = getResetTokenTtlMinutes();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [user.id],
    );
    await client.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
      [user.id, tokenHash, String(ttlMinutes)],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  await sendResetEmail(input.email, resetUrl);

  return { devResetUrl: resetUrl };
};

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const tokenHash = hashToken(input.token);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tokenResult = await client.query<{
      id: string;
      user_id: string;
      used_at: string | null;
      expired: boolean;
    }>(
      `SELECT id, user_id, used_at, (expires_at <= now()) AS expired
       FROM password_reset_tokens
       WHERE token_hash = $1
       FOR UPDATE`,
      [tokenHash],
    );

    const tokenRow = tokenResult.rows[0];
    if (!tokenRow || tokenRow.used_at !== null || tokenRow.expired) {
      throw new ApiError(
        400,
        "INVALID_OR_EXPIRED_TOKEN",
        "This reset link is invalid or has expired",
      );
    }

    const passwordHash = await bcrypt.hash(input.new_password, SALT_ROUNDS);

    await client.query(
      "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
      [passwordHash, tokenRow.user_id],
    );

    await client.query(
      "UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [tokenRow.user_id],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const changePassword = async (
  userId: string,
  input: ChangePasswordInput,
): Promise<void> => {
  const result = await pool.query<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = $1",
    [userId],
  );
  const user = result.rows[0];
  if (!user) {
    throw ApiError.unauthorized();
  }

  const currentMatches = await bcrypt.compare(
    input.current_password,
    user.password_hash,
  );
  if (!currentMatches) {
    throw new ApiError(
      403,
      "INVALID_CURRENT_PASSWORD",
      "Current password is incorrect",
    );
  }

  const passwordHash = await bcrypt.hash(input.new_password, SALT_ROUNDS);
  await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
    [passwordHash, userId],
  );
};
