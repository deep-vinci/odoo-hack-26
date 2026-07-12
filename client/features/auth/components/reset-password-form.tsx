"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordCard } from "@/components/ui/reset-password-card";
import { useResetPassword } from "@/features/auth/use-auth";

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const { mutateAsync } = useResetPassword();

    return (
        <ResetPasswordCard
            hasToken={Boolean(token)}
            onSubmit={async ({ newPassword }) => {
                await mutateAsync({ token, new_password: newPassword });
            }}
            onBack={() => router.push("/login")}
        />
    );
}
