import { ApiError, type ValidationDetail } from "../utils/ApiError";
import { USER_ROLES, isUserRole, type UserRole } from "../constants/roles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

const normalizeEmail = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const validatePasswordPolicy = (
  value: unknown,
  field: string,
  label: string,
  details: ValidationDetail[],
): string => {
  const password = typeof value === "string" ? value : "";
  if (!password) {
    details.push({ field, message: `${label} is required` });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    details.push({
      field,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }
  return password;
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const validateRegister = (body: unknown): RegisterInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) {
    details.push({ field: "name", message: "Name is required" });
  } else if (name.length > MAX_NAME_LENGTH) {
    details.push({
      field: "name",
      message: `Name must be at most ${MAX_NAME_LENGTH} characters`,
    });
  }

  const email = normalizeEmail(data.email);
  if (!email) {
    details.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(email)) {
    details.push({ field: "email", message: "Email must be a valid email address" });
  } else if (email.length > MAX_EMAIL_LENGTH) {
    details.push({
      field: "email",
      message: `Email must be at most ${MAX_EMAIL_LENGTH} characters`,
    });
  }

  const password = validatePasswordPolicy(data.password, "password", "Password", details);

  if (data.role === undefined || data.role === null || data.role === "") {
    details.push({ field: "role", message: "Role is required" });
  } else if (!isUserRole(data.role)) {
    details.push({
      field: "role",
      message: `Role must be one of: ${USER_ROLES.join(", ")}`,
    });
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { name, email, password, role: data.role as UserRole };
};

export interface LoginInput {
  email: string;
  password: string;
}

export const validateLogin = (body: unknown): LoginInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const email = normalizeEmail(data.email);
  if (!email) {
    details.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(email)) {
    details.push({ field: "email", message: "Email must be a valid email address" });
  }

  const password = typeof data.password === "string" ? data.password : "";
  if (!password) {
    details.push({ field: "password", message: "Password is required" });
  }

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { email, password };
};

export interface RefreshTokenInput {
  refresh_token: string;
}

export const validateRefreshToken = (body: unknown): RefreshTokenInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const refreshToken =
    typeof data.refresh_token === "string" ? data.refresh_token.trim() : "";

  if (!refreshToken) {
    throw ApiError.validation([
      { field: "refresh_token", message: "Refresh token is required" },
    ]);
  }

  return { refresh_token: refreshToken };
};

export interface ForgotPasswordInput {
  email: string;
}

export const validateForgotPassword = (body: unknown): ForgotPasswordInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(data.email);

  if (!email || !EMAIL_REGEX.test(email)) {
    throw ApiError.validation([
      { field: "email", message: "A valid email is required" },
    ]);
  }

  return { email };
};

export interface ResetPasswordInput {
  token: string;
  new_password: string;
}

export const validateResetPassword = (body: unknown): ResetPasswordInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const token = typeof data.token === "string" ? data.token.trim() : "";
  if (!token) {
    details.push({ field: "token", message: "Token is required" });
  }

  const newPassword = validatePasswordPolicy(
    data.new_password,
    "new_password",
    "New password",
    details,
  );

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { token, new_password: newPassword };
};

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export const validateChangePassword = (body: unknown): ChangePasswordInput => {
  const data = (body ?? {}) as Record<string, unknown>;
  const details: ValidationDetail[] = [];

  const currentPassword =
    typeof data.current_password === "string" ? data.current_password : "";
  if (!currentPassword) {
    details.push({ field: "current_password", message: "Current password is required" });
  }

  const newPassword = validatePasswordPolicy(
    data.new_password,
    "new_password",
    "New password",
    details,
  );

  if (details.length > 0) {
    throw ApiError.validation(details);
  }

  return { current_password: currentPassword, new_password: newPassword };
};
