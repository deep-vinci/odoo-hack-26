"use client";

import { useMutation } from "@tanstack/react-query";
import {
    login,
    requestPasswordReset,
    type ForgotPasswordInput,
    type ForgotPasswordResponse,
    type LoginInput,
    type LoginResponse,
} from "@/features/auth/api";

export function useLogin() {
    return useMutation<LoginResponse, Error, LoginInput>({
        mutationFn: login,
    });
}

export function useRequestPasswordReset() {
    return useMutation<ForgotPasswordResponse, Error, ForgotPasswordInput>({
        mutationFn: requestPasswordReset,
    });
}
