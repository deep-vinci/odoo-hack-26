"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { CompleteTripInput } from "@/features/trips/api";
import { useCompleteTrip } from "@/features/trips/use-trips";

const FORM_ID = "trip-complete-form";

type CompleteTarget = {
    id: string;
    trip_number: string;
    start_odometer_km: number | null;
};

type FormState = {
    endOdometer: string;
    revenue: string;
    fuelLiters: string;
    fuelCost: string;
};

const emptyForm: FormState = {
    endOdometer: "",
    revenue: "",
    fuelLiters: "",
    fuelCost: "",
};

type TripCompleteModalProps = {
    trip: CompleteTarget | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TripCompleteModal({ trip, open, onOpenChange }: TripCompleteModalProps) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [wasOpen, setWasOpen] = useState(open);

    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setForm(emptyForm);
    }

    const completeMutation = useCompleteTrip();
    const loading = completeMutation.isPending;

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!trip) return;

        const endOdometer = Number(form.endOdometer);
        if (form.endOdometer.trim() === "" || !Number.isFinite(endOdometer) || endOdometer < 0) {
            toast.error("End odometer is required and must be zero or greater.");
            return;
        }
        if (trip.start_odometer_km !== null && endOdometer < trip.start_odometer_km) {
            toast.error(
                `End odometer cannot be less than start odometer (${trip.start_odometer_km}).`,
            );
            return;
        }

        const input: CompleteTripInput = { end_odometer_km: endOdometer };

        if (form.revenue.trim() !== "") {
            const revenue = Number(form.revenue);
            if (!Number.isFinite(revenue) || revenue < 0) {
                toast.error("Revenue must be zero or greater.");
                return;
            }
            input.revenue = revenue;
        }

        const hasLiters = form.fuelLiters.trim() !== "";
        const hasCost = form.fuelCost.trim() !== "";
        if (hasLiters || hasCost) {
            const liters = Number(form.fuelLiters);
            const cost = Number(form.fuelCost);
            if (!hasLiters || !Number.isFinite(liters) || liters <= 0) {
                toast.error("Fuel liters must be greater than zero.");
                return;
            }
            if (!hasCost || !Number.isFinite(cost) || cost < 0) {
                toast.error("Fuel cost must be zero or greater.");
                return;
            }
            input.fuel_consumed = { liters, cost };
        }

        try {
            const result = await completeMutation.mutateAsync({ id: trip.id, input });
            toast.success(
                `Trip ${result.trip.trip_number} completed (${result.trip.actual_distance_km} km).`,
            );
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to complete trip. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={trip ? `Complete ${trip.trip_number}` : "Complete Trip"}
            description="Record the final odometer and optional revenue and fuel usage."
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
                        className="inline-flex h-9 min-w-[120px] cursor-pointer items-center justify-center rounded-[4px] bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            "Complete trip"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="complete-end-odometer" required>End Odometer (km)</Label>
                    <Input
                        id="complete-end-odometer"
                        type="number"
                        min={trip?.start_odometer_km ?? 0}
                        step="0.01"
                        value={form.endOdometer}
                        onChange={(e) => set("endOdometer", e.target.value)}
                        placeholder={
                            trip?.start_odometer_km !== null && trip?.start_odometer_km !== undefined
                                ? `Start was ${trip.start_odometer_km}`
                                : "e.g. 45210"
                        }
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="complete-revenue">Revenue (optional)</Label>
                    <Input
                        id="complete-revenue"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.revenue}
                        onChange={(e) => set("revenue", e.target.value)}
                        placeholder="e.g. 12000"
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="complete-fuel-liters">Fuel (liters, optional)</Label>
                        <Input
                            id="complete-fuel-liters"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.fuelLiters}
                            onChange={(e) => set("fuelLiters", e.target.value)}
                            placeholder="e.g. 40"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="complete-fuel-cost">Fuel Cost (optional)</Label>
                        <Input
                            id="complete-fuel-cost"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.fuelCost}
                            onChange={(e) => set("fuelCost", e.target.value)}
                            placeholder="e.g. 3800"
                            disabled={loading}
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    Fill both fuel fields to log fuel for this trip, or leave both blank.
                </p>
            </form>
        </Modal>
    );
}
