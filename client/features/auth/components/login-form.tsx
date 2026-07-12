"use client";

import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/ui/login-card";
import { toast } from "@/components/ui/toast";
import { useLogin } from "@/features/auth/use-auth";

export function LoginForm() {
    const router = useRouter();
    const { mutateAsync } = useLogin();

    return (
        <LoginCard
            onSubmit={async (values) => {
                try {
                    await mutateAsync(values);
                    router.push("/dashboard");
                } catch (err) {
                    toast.error(
                        err instanceof Error
                            ? err.message
                            : "Unable to sign in. Please try again.",
                    );
                }
            }}
            onForgotPassword={() => router.push("/forgot-password")}
        />
    );
}
