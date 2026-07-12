"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

type LoginCardProps = {
    title?: string;
    className?: string;
    onSubmit?: (values: {
        email: string;
        password: string;
    }) => void | Promise<void>;
    onForgotPassword?: () => void;
};

function LoginCard({
    title = "Get started with TransitOps",
    className,
    onSubmit,
    onForgotPassword,
}: LoginCardProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!onSubmit) return;
        try {
            setLoading(true);
            await onSubmit({ email, password });
        } finally {
            setLoading(false);
        }
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

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="password" required>
                            Password
                        </Label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="cursor-pointer text-sm font-medium text-gray-900 transition hover:text-gray-600"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <Button type="submit" fullWidth size="lg" disabled={loading}>
                    {loading ? (
                        <Spinner spinnerClassName="border-white/40 border-t-white" />
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>
        </div>
    );
}

export { LoginCard };
export type { LoginCardProps };
