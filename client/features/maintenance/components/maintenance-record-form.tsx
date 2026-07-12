"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import type {
    MaintenanceRecord,
    MaintenanceStatus,
    MaintenanceVehicle,
} from "@/features/maintenance/types";

export type MaintenanceFormValues = {
    vehicleId: string;
    serviceType: string;
    cost: number;
    date: string;
    status: MaintenanceStatus;
};

type MaintenanceForm = {
    vehicleId: string;
    serviceType: string;
    cost: string;
    date: string;
    status: MaintenanceStatus;
};

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function initialForm(record?: MaintenanceRecord): MaintenanceForm {
    if (record) {
        return {
            vehicleId: record.vehicleId,
            serviceType: record.serviceType,
            cost: String(record.cost),
            date: record.date,
            status: record.status,
        };
    }
    return { vehicleId: "", serviceType: "", cost: "", date: todayIso(), status: "in-shop" };
}

type MaintenanceRecordFormProps = {
    vehicles: MaintenanceVehicle[];
    vehicleInShop: (vehicleId: string) => boolean;
    onSubmit: (values: MaintenanceFormValues) => void;
    onCancel: () => void;
    record?: MaintenanceRecord;
    submitLabel?: string;
};

export function MaintenanceRecordForm({
    vehicles,
    vehicleInShop,
    onSubmit,
    onCancel,
    record,
    submitLabel = "Save",
}: MaintenanceRecordFormProps) {
    const [form, setForm] = useState<MaintenanceForm>(() => initialForm(record));

    const cost = Number(form.cost) || 0;
    const blocksDuplicateOpen = form.status === "in-shop" && form.vehicleId.length > 0 && vehicleInShop(form.vehicleId);
    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

    const canSave =
        form.vehicleId.length > 0 &&
        form.serviceType.trim().length > 0 &&
        cost > 0 &&
        form.date.length > 0 &&
        !blocksDuplicateOpen;

    function updateField<K extends keyof MaintenanceForm>(key: K, value: MaintenanceForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSave() {
        if (!canSave) return;
        onSubmit({
            vehicleId: form.vehicleId,
            serviceType: form.serviceType.trim(),
            cost,
            date: form.date,
            status: form.status,
        });
    }

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="maintenance-vehicle" required>Vehicle</Label>
                <Combobox
                    id="maintenance-vehicle"
                    value={form.vehicleId}
                    onChange={(value) => updateField("vehicleId", value)}
                    placeholder="Select vehicle…"
                    options={vehicles.map((v) => ({
                        value: v.id,
                        label: `${v.name} — ${vehicleInShop(v.id) ? "In Shop" : "Available"}`,
                    }))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="maintenance-service-type" required>Service Type</Label>
                <Input
                    id="maintenance-service-type"
                    value={form.serviceType}
                    onChange={(e) => updateField("serviceType", e.target.value)}
                    placeholder="e.g. Oil Change"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="maintenance-cost" required>Cost</Label>
                    <Input
                        id="maintenance-cost"
                        type="number"
                        min={0}
                        value={form.cost}
                        onChange={(e) => updateField("cost", e.target.value)}
                        placeholder="e.g. 2500"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="maintenance-date" required>Date</Label>
                    <Input
                        id="maintenance-date"
                        type="date"
                        value={form.date}
                        onChange={(e) => updateField("date", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label required>Status</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={form.status === "in-shop" ? "primary" : "secondary"}
                        size="sm"
                        fullWidth
                        onClick={() => updateField("status", "in-shop")}
                    >
                        In Shop
                    </Button>
                    <Button
                        type="button"
                        variant={form.status === "completed" ? "primary" : "secondary"}
                        size="sm"
                        fullWidth
                        onClick={() => updateField("status", "completed")}
                    >
                        Completed
                    </Button>
                </div>
            </div>

            {blocksDuplicateOpen && selectedVehicle && (
                <div className={cn(design.error, "flex items-center gap-1.5")} role="alert">
                    <WarningCircleIcon size={14} weight="bold" className="shrink-0" />
                    {selectedVehicle.name} already has an open service record — mark it Completed first.
                </div>
            )}

            <div className="mt-1 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" variant="primary" disabled={!canSave} onClick={handleSave}>
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}
