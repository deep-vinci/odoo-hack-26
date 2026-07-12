"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

type ResetPasswordCardProps = {
    title?: string;
    className?: string;
    hasToken?: boolean;
    onSubmit?: (values: { newPassword: string }) => void | Promise<void>;
    onBack?: () => void;
};

function ResetPasswordCard({
    title = "Set a new password",
    className,
    hasToken = true,
    onSubmit,
    onBack,
}: ResetPasswordCardProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!hasToken) {
            toast.error(
                "This reset link is invalid or has expired. Request a new one.",
            );
        }
    }, [hasToken]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!onSubmit) return;
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            await onSubmit({ newPassword });
            setDone(true);
            toast.success("Your password has been reset. You can now log in.");
        } catch (err) {
            setDone(false);
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to reset password. Please try again.",
            );
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

            {done ? (
                <div className="mt-8 space-y-5">
                    <p className="text-sm text-gray-600">
                        Your password has been reset. You can now log in with
                        your new password.
                    </p>
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
            ) : !hasToken ? (
                <div className="mt-8 space-y-5">
                    <p className="text-sm text-gray-600">
                        This reset link is invalid or has expired. Request a new
                        one from the forgot password page.
                    </p>
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
                        Choose a new password for your account.
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="new-password" required>
                            New password
                        </Label>
                        <Input
                            id="new-password"
                            name="new-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            disabled={loading}
                            minLength={MIN_PASSWORD_LENGTH}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" required>
                            Confirm password
                        </Label>
                        <Input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            disabled={loading}
                            minLength={MIN_PASSWORD_LENGTH}
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
                            "Update password"
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

export { ResetPasswordCard };
export type { ResetPasswordCardProps };
