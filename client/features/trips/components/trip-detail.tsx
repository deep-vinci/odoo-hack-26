"use client";

import { Pill } from "@/components/ui/pill";
import { TripLifecycle } from "@/features/trips/components/trip-lifecycle";
import {
    tripStatusLabel,
    tripStatusVariant,
    type DispatchDriver,
    type DispatchVehicle,
    type Trip,
} from "@/features/trips/types";

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</dt>
            <dd className="text-sm text-[#1f2430]">{value}</dd>
        </div>
    );
}

type TripDetailProps = {
    trip: Trip;
    vehicles: DispatchVehicle[];
    drivers: DispatchDriver[];
};

export function TripDetail({ trip, vehicles, drivers }: TripDetailProps) {
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="pt-1">
                <TripLifecycle status={trip.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Pill variant={tripStatusVariant[trip.status]}>{tripStatusLabel[trip.status]}</Pill>
                {trip.note ? <span className="text-sm text-gray-500">{trip.note}</span> : null}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Vehicle" value={vehicle?.name ?? "—"} />
                <Field label="Driver" value={driver?.name ?? "—"} />
                <Field
                    label="Cargo"
                    value={trip.cargoWeightKg ? `${trip.cargoWeightKg.toLocaleString("en-IN")} kg` : "—"}
                />
                <Field
                    label="Distance"
                    value={trip.plannedDistanceKm ? `${trip.plannedDistanceKm.toLocaleString("en-IN")} km` : "—"}
                />
            </dl>
        </div>
    );
}
