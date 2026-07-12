"use client";

import { useRouter } from "next/navigation";
import { ForgotPasswordCard } from "@/components/ui/forgot-password-card";
import { useRequestPasswordReset } from "@/features/auth/use-auth";

export function ForgotPasswordForm() {
    const router = useRouter();
    const { mutateAsync, error } = useRequestPasswordReset();

    return (
        <ForgotPasswordCard
            error={error?.message}
            onSubmit={async (values) => {
                await mutateAsync(values);
            }}
            onBack={() => router.push("/login")}
        />
    );
}
