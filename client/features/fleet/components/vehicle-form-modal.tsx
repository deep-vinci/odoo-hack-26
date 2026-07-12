"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
    VEHICLE_TYPES,
    type CreateVehicleInput,
    type Vehicle,
    type VehicleType,
} from "@/features/fleet/api";
import {
    useCreateVehicle,
    useUpdateVehicle,
} from "@/features/fleet/use-vehicles";

const TYPE_LABELS: Record<VehicleType, string> = {
    truck: "Truck",
    van: "Van",
    mini_truck: "Mini Truck",
    trailer: "Trailer",
    other: "Other",
};

const typeOptions = VEHICLE_TYPES.map((type) => ({
    value: type,
    label: TYPE_LABELS[type],
}));

type FormState = {
    registration_number: string;
    name: string;
    type: VehicleType | "";
    max_load_capacity_kg: string;
    odometer_km: string;
    acquisition_cost: string;
    region: string;
};

const emptyForm: FormState = {
    registration_number: "",
    name: "",
    type: "",
    max_load_capacity_kg: "",
    odometer_km: "",
    acquisition_cost: "",
    region: "",
};

const toFormState = (vehicle: Vehicle): FormState => ({
    registration_number: vehicle.registration_number,
    name: vehicle.name,
    type: vehicle.type,
    max_load_capacity_kg: String(vehicle.max_load_capacity_kg),
    odometer_km: String(vehicle.odometer_km),
    acquisition_cost: String(vehicle.acquisition_cost),
    region: vehicle.region ?? "",
});

const FORM_ID = "vehicle-form";

type VehicleFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle?: Vehicle | null;
};

export function VehicleFormModal({
    open,
    onOpenChange,
    vehicle,
}: VehicleFormModalProps) {
    const isEdit = Boolean(vehicle);
    const [form, setForm] = useState<FormState>(
        vehicle ? toFormState(vehicle) : emptyForm,
    );
    const [editingId, setEditingId] = useState<string | null>(
        vehicle?.id ?? null,
    );

    const createMutation = useCreateVehicle();
    const updateMutation = useUpdateVehicle();
    const loading = createMutation.isPending || updateMutation.isPending;

    const nextId = vehicle?.id ?? null;
    if (open && nextId !== editingId) {
        setEditingId(nextId);
        setForm(vehicle ? toFormState(vehicle) : emptyForm);
    }

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form.type) {
            toast.error("Please select a vehicle type.");
            return;
        }

        const payload: CreateVehicleInput = {
            registration_number: form.registration_number.trim().toUpperCase(),
            name: form.name.trim(),
            type: form.type,
            max_load_capacity_kg: Number(form.max_load_capacity_kg),
            odometer_km: form.odometer_km === "" ? 0 : Number(form.odometer_km),
            acquisition_cost: Number(form.acquisition_cost),
            region: form.region.trim() ? form.region.trim() : null,
        };

        try {
            if (isEdit && vehicle) {
                await updateMutation.mutateAsync({
                    id: vehicle.id,
                    input: payload,
                });
                toast.success("Vehicle updated.");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("Vehicle added.");
            }
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to save vehicle. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
            description={
                isEdit
                    ? "Update the vehicle details below."
                    : "Register a new vehicle in the fleet."
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
                        ) : isEdit ? (
                            "Save changes"
                        ) : (
                            "Add vehicle"
                        )}
                    </button>
                </>
            }
        >
            <form
                id={FORM_ID}
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <Label htmlFor="registration_number" required>
                        Registration number
                    </Label>
                    <Input
                        id="registration_number"
                        name="registration_number"
                        placeholder="GJ01AB4521"
                        value={form.registration_number}
                        onChange={(event) =>
                            set("registration_number", event.target.value)
                        }
                        disabled={loading}
                        maxLength={20}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name" required>
                        Name / Model
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="VAN-05"
                        value={form.name}
                        onChange={(event) => set("name", event.target.value)}
                        disabled={loading}
                        maxLength={100}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type" required>
                        Type
                    </Label>
                    <Combobox
                        id="type"
                        placeholder="Select type…"
                        value={form.type}
                        options={typeOptions}
                        onChange={(value) => set("type", value as VehicleType)}
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="max_load_capacity_kg" required>
                            Max load (kg)
                        </Label>
                        <Input
                            id="max_load_capacity_kg"
                            name="max_load_capacity_kg"
                            type="number"
                            min={0.01}
                            step="0.01"
                            placeholder="500"
                            value={form.max_load_capacity_kg}
                            onChange={(event) =>
                                set("max_load_capacity_kg", event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="odometer_km">Odometer (km)</Label>
                        <Input
                            id="odometer_km"
                            name="odometer_km"
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0"
                            value={form.odometer_km}
                            onChange={(event) =>
                                set("odometer_km", event.target.value)
                            }
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="acquisition_cost" required>
                            Acquisition cost
                        </Label>
                        <Input
                            id="acquisition_cost"
                            name="acquisition_cost"
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="620000"
                            value={form.acquisition_cost}
                            onChange={(event) =>
                                set("acquisition_cost", event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                            id="region"
                            name="region"
                            placeholder="Ahmedabad"
                            value={form.region}
                            onChange={(event) =>
                                set("region", event.target.value)
                            }
                            disabled={loading}
                            maxLength={100}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
