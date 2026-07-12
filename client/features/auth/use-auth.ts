"use client";

import { useMutation } from "@tanstack/react-query";
import {
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    type ForgotPasswordInput,
    type ForgotPasswordResponse,
    type LoginInput,
    type LoginResponse,
    type ResetPasswordInput,
} from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
import {
    clearStoredSession,
    getStoredRefreshToken,
    setStoredSession,
} from "@/lib/auth-storage";

export function useLogin() {
    return useMutation<LoginResponse, ApiError, LoginInput>({
        mutationFn: login,
        onSuccess: (data) => {
            setStoredSession(data.access_token, data.refresh_token, data.user);
        },
    });
}

export function useRequestPasswordReset() {
    return useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordInput>({
        mutationFn: requestPasswordReset,
    });
}

export function useResetPassword() {
    return useMutation<{ message: string }, ApiError, ResetPasswordInput>({
        mutationFn: resetPassword,
    });
}

export function useLogout() {
    return useMutation<void, ApiError, void>({
        mutationFn: async () => {
            const refreshToken = getStoredRefreshToken();
            if (refreshToken) {
                await logout(refreshToken).catch(() => undefined);
            }
            clearStoredSession();
        },
    });
}
