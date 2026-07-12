import { apiFetch } from "@/lib/api-client";

export type UserRole =
    | "fleet_manager"
    | "dispatcher"
    | "safety_officer"
    | "financial_analyst";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

export type LoginInput = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
    user: AuthUser;
};

export function login(input: LoginInput) {
    return apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        auth: false,
        body: input,
    });
}

export function getMe() {
    return apiFetch<{ user: AuthUser }>("/api/v1/auth/me", {
        method: "GET",
    });
}

export function logout(refreshToken: string) {
    return apiFetch<{ message: string }>("/api/v1/auth/logout", {
        method: "POST",
        auth: false,
        body: { refresh_token: refreshToken },
    });
}

export type ForgotPasswordInput = {
    email: string;
};

export type ForgotPasswordResponse = {
    message: string;
    dev_reset_url?: string;
};

export function requestPasswordReset(input: ForgotPasswordInput) {
    return apiFetch<ForgotPasswordResponse>("/api/v1/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: input,
    });
}

export type ResetPasswordInput = {
    token: string;
    new_password: string;
};

export function resetPassword(input: ResetPasswordInput) {
    return apiFetch<{ message: string }>("/api/v1/auth/reset-password", {
        method: "POST",
        auth: false,
        body: input,
    });
}
