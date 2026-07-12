"use client";

import { useState, type FormEvent } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import type {
    CreateMaintenanceInput,
    MaintenanceRecord,
    UpdateMaintenanceInput,
} from "@/features/maintenance/api";
import {
    useAvailableVehicles,
    useCreateMaintenance,
    useUpdateMaintenance,
} from "@/features/maintenance/use-maintenance";

type FormState = {
    vehicle_id: string;
    title: string;
    description: string;
    cost: string;
};

const emptyForm: FormState = {
    vehicle_id: "",
    title: "",
    description: "",
    cost: "",
};

const toFormState = (record: MaintenanceRecord): FormState => ({
    vehicle_id: record.vehicle.id,
    title: record.title,
    description: record.description ?? "",
    cost: String(record.cost),
});

const FORM_ID = "maintenance-form";

type MaintenanceFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record?: MaintenanceRecord | null;
};

export function MaintenanceFormModal({
    open,
    onOpenChange,
    record,
}: MaintenanceFormModalProps) {
    const isEdit = Boolean(record);
    const [form, setForm] = useState<FormState>(
        record ? toFormState(record) : emptyForm,
    );
    const [editingId, setEditingId] = useState<string | null>(record?.id ?? null);

    const vehiclesQuery = useAvailableVehicles();
    const createMutation = useCreateMaintenance();
    const updateMutation = useUpdateMaintenance();
    const loading = createMutation.isPending || updateMutation.isPending;

    const nextId = record?.id ?? null;
    if (open && nextId !== editingId) {
        setEditingId(nextId);
        setForm(record ? toFormState(record) : emptyForm);
    }

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const vehicleOptions = (vehiclesQuery.data?.vehicles ?? []).map((vehicle) => ({
        value: vehicle.id,
        label: `${vehicle.name}, ${vehicle.registration_number}`,
    }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const title = form.title.trim();
        const cost = Number(form.cost);
        const description = form.description.trim() ? form.description.trim() : null;

        if (!isEdit && !form.vehicle_id) {
            toast.error("Please select a vehicle.");
            return;
        }
        if (!title) {
            toast.error("Please enter a service type.");
            return;
        }
        if (!Number.isFinite(cost) || cost < 0) {
            toast.error("Please enter a valid cost.");
            return;
        }

        try {
            if (isEdit && record) {
                const input: UpdateMaintenanceInput = { title, description, cost };
                await updateMutation.mutateAsync({ id: record.id, input });
                toast.success("Service record updated.");
            } else {
                const input: CreateMaintenanceInput = {
                    vehicle_id: form.vehicle_id,
                    title,
                    description,
                    cost,
                };
                await createMutation.mutateAsync(input);
                toast.success("Service record logged.");
            }
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to save service record. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit Service Record" : "Log Service Record"}
            description={
                isEdit
                    ? "Update the details of this maintenance record."
                    : "Record vehicle maintenance and move it into the shop."
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
                        className="inline-flex h-9 min-w-[120px] cursor-pointer items-center justify-center rounded-[4px] border border-[#2C5EAD] bg-[#2C5EAD] px-4 text-sm font-medium text-white transition hover:border-[#244f96] hover:bg-[#244f96] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : isEdit ? (
                            "Save changes"
                        ) : (
                            "Log record"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="maintenance-vehicle" required>
                        Vehicle
                    </Label>
                    {isEdit && record ? (
                        <Input
                            id="maintenance-vehicle"
                            value={`${record.vehicle.name}, ${record.vehicle.registration_number}`}
                            disabled
                            readOnly
                        />
                    ) : (
                        <Combobox
                            id="maintenance-vehicle"
                            placeholder={
                                vehiclesQuery.isLoading
                                    ? "Loading vehicles…"
                                    : "Select a vehicle…"
                            }
                            value={form.vehicle_id}
                            options={vehicleOptions}
                            onChange={(value) => set("vehicle_id", value)}
                            disabled={loading || vehiclesQuery.isLoading}
                            noOptionsMessage="No available vehicles"
                        />
                    )}
                    {!isEdit ? (
                        <p className={design.hint}>
                            Only vehicles that are currently available can enter the shop.
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maintenance-title" required>
                        Service Type
                    </Label>
                    <Input
                        id="maintenance-title"
                        placeholder="e.g. Oil Change"
                        value={form.title}
                        onChange={(event) => set("title", event.target.value)}
                        disabled={loading}
                        maxLength={150}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maintenance-description">Description</Label>
                    <textarea
                        id="maintenance-description"
                        placeholder="Optional notes about the work performed…"
                        value={form.description}
                        onChange={(event) => set("description", event.target.value)}
                        disabled={loading}
                        rows={3}
                        className={cn(design.input, "h-auto min-h-[76px] resize-y py-2")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maintenance-cost" required>
                        Cost
                    </Label>
                    <Input
                        id="maintenance-cost"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 2500"
                        value={form.cost}
                        onChange={(event) => set("cost", event.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
            </form>
        </Modal>
    );
}
