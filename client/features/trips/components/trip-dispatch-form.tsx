"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { DispatchDriver, DispatchVehicle } from "@/features/trips/types";

export type TripDispatchValues = {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeightKg: number;
    plannedDistanceKm: number;
};

type TripDispatchForm = {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeightKg: string;
    plannedDistanceKm: string;
};

const emptyForm: TripDispatchForm = {
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeightKg: "",
    plannedDistanceKm: "",
};

type TripDispatchFormProps = {
    vehicles: DispatchVehicle[];
    drivers: DispatchDriver[];
    onSubmit: (values: TripDispatchValues) => void;
    onCancel: () => void;
};

export function TripDispatchForm({ vehicles, drivers, onSubmit, onCancel }: TripDispatchFormProps) {
    const [form, setForm] = useState<TripDispatchForm>(emptyForm);

    const availableVehicles = vehicles.filter((v) => v.status === "available");
    const availableDrivers = drivers.filter((d) => d.status === "available");
    const selectedVehicle = availableVehicles.find((v) => v.id === form.vehicleId);
    const cargoWeightKg = Number(form.cargoWeightKg) || 0;
    const plannedDistanceKm = Number(form.plannedDistanceKm) || 0;
    const capacityExceeded = Boolean(selectedVehicle) && cargoWeightKg > (selectedVehicle?.capacityKg ?? 0);

    const canDispatch =
        form.source.trim().length > 0 &&
        form.destination.trim().length > 0 &&
        form.vehicleId.length > 0 &&
        form.driverId.length > 0 &&
        cargoWeightKg > 0 &&
        plannedDistanceKm > 0 &&
        !capacityExceeded;

    function updateField<K extends keyof TripDispatchForm>(key: K, value: TripDispatchForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleDispatch() {
        if (!canDispatch) return;
        onSubmit({
            source: form.source.trim(),
            destination: form.destination.trim(),
            vehicleId: form.vehicleId,
            driverId: form.driverId,
            cargoWeightKg,
            plannedDistanceKm,
        });
    }

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-source" required>Source</Label>
                    <Input
                        id="trip-source"
                        value={form.source}
                        onChange={(e) => updateField("source", e.target.value)}
                        placeholder="e.g. Gandhinagar Depot"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-destination" required>Destination</Label>
                    <Input
                        id="trip-destination"
                        value={form.destination}
                        onChange={(e) => updateField("destination", e.target.value)}
                        placeholder="e.g. Ahmedabad Hub"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="trip-vehicle" required>Vehicle (available only)</Label>
                <Combobox
                    id="trip-vehicle"
                    value={form.vehicleId}
                    onChange={(value) => updateField("vehicleId", value)}
                    placeholder="Select vehicle…"
                    noOptionsMessage="No available vehicles"
                    options={availableVehicles.map((v) => ({
                        value: v.id,
                        label: `${v.name} — ${v.capacityKg.toLocaleString("en-IN")} kg capacity`,
                    }))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="trip-driver" required>Driver (available only)</Label>
                <Combobox
                    id="trip-driver"
                    value={form.driverId}
                    onChange={(value) => updateField("driverId", value)}
                    placeholder="Select driver…"
                    noOptionsMessage="No available drivers"
                    options={availableDrivers.map((d) => ({ value: d.id, label: d.name }))}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-cargo" required>Cargo Weight (kg)</Label>
                    <Input
                        id="trip-cargo"
                        type="number"
                        min={0}
                        value={form.cargoWeightKg}
                        onChange={(e) => updateField("cargoWeightKg", e.target.value)}
                        placeholder="e.g. 700"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-distance" required>Planned Distance (km)</Label>
                    <Input
                        id="trip-distance"
                        type="number"
                        min={0}
                        value={form.plannedDistanceKm}
                        onChange={(e) => updateField("plannedDistanceKm", e.target.value)}
                        placeholder="e.g. 38"
                    />
                </div>
            </div>

            {capacityExceeded && selectedVehicle && (
                <div className={cn(design.error, "flex flex-col gap-1")} role="alert">
                    <span>Vehicle Capacity: {selectedVehicle.capacityKg.toLocaleString("en-IN")} kg</span>
                    <span>Cargo Weight: {cargoWeightKg.toLocaleString("en-IN")} kg</span>
                    <span className="flex items-center gap-1.5 font-medium">
                        <WarningCircleIcon size={14} weight="bold" />
                        Capacity exceeded by {(cargoWeightKg - selectedVehicle.capacityKg).toLocaleString("en-IN")} kg — dispatch blocked
                    </span>
                </div>
            )}

            <div className="mt-1 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" variant="primary" disabled={!canDispatch} onClick={handleDispatch}>
                    Dispatch
                </Button>
            </div>
        </div>
    );
}
