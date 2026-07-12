"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { Driver } from "@/features/drivers/api";
import { useUpdateDriverSafetyScore } from "@/features/drivers/use-drivers";

const FORM_ID = "driver-safety-score-form";

type DriverSafetyScoreModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    driver: Driver | null;
};

export function DriverSafetyScoreModal({
    open,
    onOpenChange,
    driver,
}: DriverSafetyScoreModalProps) {
    const [value, setValue] = useState<string>("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const mutation = useUpdateDriverSafetyScore();
    const loading = mutation.isPending;

    const nextId = driver?.id ?? null;
    if (open && nextId !== editingId) {
        setEditingId(nextId);
        setValue(driver ? String(driver.safety_score) : "");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!driver) return;

        const score = Number(value);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            toast.error("Safety score must be a number between 0 and 100.");
            return;
        }

        try {
            await mutation.mutateAsync({ id: driver.id, safety_score: score });
            toast.success(`Safety score updated for ${driver.name}.`);
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to update safety score. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Update safety score"
            description={
                driver
                    ? `Set the safety score for ${driver.name}.`
                    : ""
            }
            footer={
                <>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#1f2430] transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form={FORM_ID}
                        disabled={loading}
                        className="inline-flex h-9 min-w-[110px] cursor-pointer items-center justify-center rounded-[4px] border border-[#2C5EAD] bg-[#2C5EAD] px-4 text-sm font-medium text-white transition hover:border-[#244f96] hover:bg-[#244f96] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            "Save score"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-2">
                <Label htmlFor="safety_score" required>
                    Safety score (0–100)
                </Label>
                <Input
                    id="safety_score"
                    name="safety_score"
                    type="number"
                    min={0}
                    max={100}
                    step="1"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    disabled={loading}
                    required
                />
            </form>
        </Modal>
    );
}
