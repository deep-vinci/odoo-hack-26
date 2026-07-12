"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { design } from "@/lib/design";
import type { MaintenanceRecord } from "@/features/maintenance/api";
import { useCloseMaintenance } from "@/features/maintenance/use-maintenance";

const FORM_ID = "maintenance-complete-form";

type MaintenanceCompleteModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: MaintenanceRecord | null;
};

export function MaintenanceCompleteModal({
    open,
    onOpenChange,
    record,
}: MaintenanceCompleteModalProps) {
    const [cost, setCost] = useState("");
    const [editingId, setEditingId] = useState<string | null>(record?.id ?? null);

    const closeMutation = useCloseMaintenance();
    const loading = closeMutation.isPending;

    const nextId = record?.id ?? null;
    if (open && nextId !== editingId) {
        setEditingId(nextId);
        setCost(record ? String(record.cost) : "");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!record) return;

        const parsed = Number(cost);
        if (cost.trim() !== "" && (!Number.isFinite(parsed) || parsed < 0)) {
            toast.error("Please enter a valid final cost.");
            return;
        }

        try {
            await closeMutation.mutateAsync({
                id: record.id,
                input: cost.trim() === "" ? {} : { cost: parsed },
            });
            toast.success("Service record completed.");
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to complete service record. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Mark as Completed"
            description="Close this service record and return the vehicle to available."
            className="max-w-[420px]"
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
                        className="inline-flex h-9 min-w-[140px] cursor-pointer items-center justify-center rounded-[4px] bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            "Mark Completed"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
                {record ? (
                    <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#1f2430]">
                            {record.vehicle.name}
                        </span>
                        {": "}
                        {record.title}
                    </p>
                ) : null}
                <div className="space-y-2">
                    <Label htmlFor="maintenance-final-cost">Final cost</Label>
                    <Input
                        id="maintenance-final-cost"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Final cost"
                        value={cost}
                        onChange={(event) => setCost(event.target.value)}
                        disabled={loading}
                    />
                    <p className={design.hint}>
                        Adjust the final cost if it changed, or leave it as-is.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
