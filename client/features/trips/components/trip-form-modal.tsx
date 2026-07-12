"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useDrivers } from "@/features/drivers/use-drivers";
import { useVehicles } from "@/features/fleet/use-vehicles";
import type { CreateTripInput } from "@/features/trips/api";
import { useCreateTrip } from "@/features/trips/use-trips";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

type FormState = {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeightKg: string;
    plannedDistanceKm: string;
    revenue: string;
};

const emptyForm: FormState = {
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeightKg: "",
    plannedDistanceKm: "",
    revenue: "",
};

const numberFormat = new Intl.NumberFormat("en-IN");

const FORM_ID = "trip-create-form";

type TripFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TripFormModal({ open, onOpenChange }: TripFormModalProps) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [wasOpen, setWasOpen] = useState(open);

    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setForm(emptyForm);
    }

    const vehiclesQuery = useVehicles({ status: "available", limit: 100 });
    const driversQuery = useDrivers({ available_for_dispatch: true, limit: 100 });
    const createMutation = useCreateTrip();
    const loading = createMutation.isPending;

    const vehicles = vehiclesQuery.data?.vehicles ?? [];
    const drivers = driversQuery.data?.drivers ?? [];

    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
    const cargoWeightKg = Number(form.cargoWeightKg) || 0;
    const plannedDistanceKm = Number(form.plannedDistanceKm) || 0;
    const revenue = form.revenue.trim() === "" ? undefined : Number(form.revenue);
    const capacityExceeded =
        Boolean(selectedVehicle) && cargoWeightKg > (selectedVehicle?.max_load_capacity_kg ?? 0);

    const canSubmit =
        form.source.trim().length > 0 &&
        form.destination.trim().length > 0 &&
        form.vehicleId.length > 0 &&
        form.driverId.length > 0 &&
        cargoWeightKg > 0 &&
        plannedDistanceKm > 0 &&
        !capacityExceeded &&
        (revenue === undefined || revenue >= 0);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) return;

        const payload: CreateTripInput = {
            source: form.source.trim(),
            destination: form.destination.trim(),
            vehicle_id: form.vehicleId,
            driver_id: form.driverId,
            cargo_weight_kg: cargoWeightKg,
            planned_distance_km: plannedDistanceKm,
            ...(revenue !== undefined ? { revenue } : {}),
        };

        try {
            const { trip } = await createMutation.mutateAsync(payload);
            toast.success(`Trip ${trip.trip_number} created as draft.`);
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to create trip. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="New Trip"
            description="Create a draft trip and assign an available vehicle and driver."
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
                        disabled={loading || !canSubmit}
                        className="inline-flex h-9 min-w-[110px] cursor-pointer items-center justify-center rounded-[4px] border border-[#2C5EAD] bg-[#2C5EAD] px-4 text-sm font-medium text-white transition hover:border-[#244f96] hover:bg-[#244f96] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            "Create trip"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="trip-source" required>Source</Label>
                        <Input
                            id="trip-source"
                            value={form.source}
                            onChange={(e) => set("source", e.target.value)}
                            placeholder="e.g. Gandhinagar Depot"
                            maxLength={255}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="trip-destination" required>Destination</Label>
                        <Input
                            id="trip-destination"
                            value={form.destination}
                            onChange={(e) => set("destination", e.target.value)}
                            placeholder="e.g. Ahmedabad Hub"
                            maxLength={255}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-vehicle" required>Vehicle (available only)</Label>
                    <Combobox
                        id="trip-vehicle"
                        value={form.vehicleId}
                        onChange={(value) => set("vehicleId", value)}
                        placeholder="Select vehicle…"
                        noOptionsMessage={
                            vehiclesQuery.isLoading ? "Loading…" : "No available vehicles"
                        }
                        disabled={loading}
                        options={vehicles.map((v) => ({
                            value: v.id,
                            label: `${v.name} (${v.registration_number}) — ${numberFormat.format(v.max_load_capacity_kg)} kg`,
                        }))}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-driver" required>Driver (available only)</Label>
                    <Combobox
                        id="trip-driver"
                        value={form.driverId}
                        onChange={(value) => set("driverId", value)}
                        placeholder="Select driver…"
                        noOptionsMessage={
                            driversQuery.isLoading ? "Loading…" : "No available drivers"
                        }
                        disabled={loading}
                        options={drivers.map((d) => ({ value: d.id, label: d.name }))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="trip-cargo" required>Cargo Weight (kg)</Label>
                        <Input
                            id="trip-cargo"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.cargoWeightKg}
                            onChange={(e) => set("cargoWeightKg", e.target.value)}
                            placeholder="e.g. 700"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="trip-distance" required>Planned Distance (km)</Label>
                        <Input
                            id="trip-distance"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.plannedDistanceKm}
                            onChange={(e) => set("plannedDistanceKm", e.target.value)}
                            placeholder="e.g. 38"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-revenue">Revenue (optional)</Label>
                    <Input
                        id="trip-revenue"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.revenue}
                        onChange={(e) => set("revenue", e.target.value)}
                        placeholder="e.g. 12000"
                        disabled={loading}
                    />
                </div>

                {capacityExceeded && selectedVehicle ? (
                    <div className={cn(design.error, "flex flex-col gap-1")} role="alert">
                        <span>Vehicle Capacity: {numberFormat.format(selectedVehicle.max_load_capacity_kg)} kg</span>
                        <span>Cargo Weight: {numberFormat.format(cargoWeightKg)} kg</span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <WarningCircleIcon size={14} weight="bold" />
                            Capacity exceeded by {numberFormat.format(cargoWeightKg - selectedVehicle.max_load_capacity_kg)} kg
                        </span>
                    </div>
                ) : null}
            </form>
        </Modal>
    );
}
