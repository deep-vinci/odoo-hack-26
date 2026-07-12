"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { DispatchTripInput } from "@/features/trips/api";
import { useDispatchTrip } from "@/features/trips/use-trips";

const FORM_ID = "trip-dispatch-form";

type DispatchTarget = {
    id: string;
    trip_number: string;
};

type TripDispatchModalProps = {
    trip: DispatchTarget | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TripDispatchModal({ trip, open, onOpenChange }: TripDispatchModalProps) {
    const [startOdometer, setStartOdometer] = useState("");
    const [wasOpen, setWasOpen] = useState(open);

    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setStartOdometer("");
    }

    const dispatchMutation = useDispatchTrip();
    const loading = dispatchMutation.isPending;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!trip) return;

        const trimmed = startOdometer.trim();
        const input: DispatchTripInput = {};
        if (trimmed !== "") {
            const value = Number(trimmed);
            if (!Number.isFinite(value) || value < 0) {
                toast.error("Start odometer must be zero or greater.");
                return;
            }
            input.start_odometer_km = value;
        }

        try {
            const result = await dispatchMutation.mutateAsync({ id: trip.id, input });
            toast.success(`Trip ${result.trip.trip_number} dispatched.`);
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to dispatch trip. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={trip ? `Dispatch ${trip.trip_number}` : "Dispatch Trip"}
            description="Assign the vehicle and driver to this trip and set it in transit."
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
                            "Dispatch"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-1.5">
                <Label htmlFor="dispatch-start-odometer">Start Odometer (km)</Label>
                <Input
                    id="dispatch-start-odometer"
                    type="number"
                    min={0}
                    step="0.01"
                    value={startOdometer}
                    onChange={(e) => setStartOdometer(e.target.value)}
                    placeholder="Defaults to vehicle's current odometer"
                    disabled={loading}
                />
                <p className="text-xs text-gray-500">
                    Leave blank to use the vehicle&apos;s current odometer reading.
                </p>
            </form>
        </Modal>
    );
}
