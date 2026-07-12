"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

const fieldClassName = "bg-indigo-50 border-indigo-100";
const RESEND_COOLDOWN_SECONDS = 60;

type ForgotPasswordCardProps = {
    title?: string;
    className?: string;
    error?: string;
    onSubmit?: (values: { email: string }) => void | Promise<void>;
    onBack?: () => void;
};

function ForgotPasswordCard({
    title = "Reset your password",
    className,
    error,
    onSubmit,
    onBack,
}: ForgotPasswordCardProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setTimeout(
            () => setCooldown((seconds) => seconds - 1),
            1000,
        );
        return () => clearTimeout(id);
    }, [cooldown]);

    async function submit() {
        try {
            setLoading(true);
            await onSubmit?.({ email });
            setSent(true);
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await submit();
    }

    return (
        <div
            className={cn(
                design.card,
                "w-full max-w-100 animate-fade-in p-8",
                className,
            )}
        >
            <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>

            {sent ? (
                <div className="mt-8 space-y-5">
                    <div className={design.success}>
                        If an account exists for{" "}
                        <span className="font-medium">{email}</span>, we&apos;ve
                        sent a password reset link. Check your inbox.
                    </div>

                    <button
                        type="button"
                        onClick={submit}
                        disabled={cooldown > 0 || loading}
                        className="cursor-pointer text-sm font-medium text-gray-900 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {cooldown > 0
                            ? `Resend email in ${cooldown}s`
                            : "Resend email"}
                    </button>

                    {onBack ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="block w-full cursor-pointer text-center text-sm font-medium text-gray-900 transition hover:text-gray-600"
                        >
                            Back to login
                        </button>
                    ) : null}
                </div>
            ) : (
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <p className="text-sm text-gray-600">
                        Enter your email and we&apos;ll send you a link to reset
                        your password.
                    </p>

                    {error ? <div className={design.error}>{error}</div> : null}

                    <div className="space-y-2">
                        <Label htmlFor="email" required>
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className={fieldClassName}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            "Send reset link"
                        )}
                    </Button>

                    {onBack ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="block w-full cursor-pointer text-center text-sm font-medium text-gray-900 transition hover:text-gray-600"
                        >
                            Back to login
                        </button>
                    ) : null}
                </form>
            )}
        </div>
    );
}

export { ForgotPasswordCard };
export type { ForgotPasswordCardProps };
