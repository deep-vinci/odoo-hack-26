"use client";

import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/ui/login-card";

export function LoginForm() {
    const router = useRouter();

    return (
        <LoginCard
            onSubmit={() => {
                router.push("/dashboard");
            }}
            onForgotPassword={() => router.push("/forgot-password")}
        />
    );
}
