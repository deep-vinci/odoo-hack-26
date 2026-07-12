"use client";

import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/ui/login-card";
import { useLogin } from "@/features/auth/use-auth";

export function LoginForm() {
    const router = useRouter();
    const { mutateAsync, error } = useLogin();

    return (
        <LoginCard
            error={error?.message}
            onSubmit={async (values) => {
                await mutateAsync(values);
                router.push("/");
            }}
            onForgotPassword={() => router.push("/forgot-password")}
        />
    );
}
