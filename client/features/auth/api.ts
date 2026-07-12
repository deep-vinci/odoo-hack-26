import { apiFetch } from "@/lib/api-client";

export type LoginInput = {
    email: string;
    password: string;
};

export type AuthUser = {
    id: string;
    email: string;
};

export type LoginResponse = {
    user: AuthUser;
};

export function login(input: LoginInput) {
    return apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: input,
    });
}

export type ForgotPasswordInput = {
    email: string;
};

export type ForgotPasswordResponse = {
    success: boolean;
};

export function requestPasswordReset(input: ForgotPasswordInput) {
    return apiFetch<ForgotPasswordResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: input,
    });
}
