"use client";

import type { ReactNode } from "react";
import { Pill } from "@/components/ui/pill";
import { Spinner } from "@/components/ui/spinner";
import { tripStatusLabel, tripStatusVariant } from "@/features/trips/api";
import { TripLifecycle } from "@/features/trips/components/trip-lifecycle";
import { useTrip } from "@/features/trips/use-trips";

const noneValue = <span className="text-gray-400">None</span>;

const numberFormat = new Intl.NumberFormat("en-IN");

const formatDateTime = (value: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

function Field({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</dt>
            <dd className="text-sm text-[#1f2430]">{value}</dd>
        </div>
    );
}

type TripDetailProps = {
    tripId: string;
};

export function TripDetail({ tripId }: TripDetailProps) {
    const { data, isLoading, isError, error } = useTrip(tripId);

    if (isLoading) {
        return (
            <div className="flex min-h-32 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <p className="text-sm text-red-600">
                {error?.message ?? "Unable to load trip details."}
            </p>
        );
    }

    const { trip, actual_distance_km, fuel_logs, expenses } = data;

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="pt-1">
                <TripLifecycle status={trip.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Pill variant={tripStatusVariant[trip.status]}>{tripStatusLabel[trip.status]}</Pill>
                <span className="text-sm text-gray-500">{trip.trip_number}</span>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field
                    label="Vehicle"
                    value={`${trip.vehicle.name} (${trip.vehicle.registration_number})`}
                />
                <Field label="Driver" value={trip.driver.name} />
                <Field
                    label="Cargo"
                    value={`${numberFormat.format(trip.cargo_weight_kg)} kg`}
                />
                <Field
                    label="Planned Distance"
                    value={`${numberFormat.format(trip.planned_distance_km)} km`}
                />
                <Field
                    label="Revenue"
                    value={trip.revenue !== null ? numberFormat.format(trip.revenue) : noneValue}
                />
                <Field
                    label="Actual Distance"
                    value={
                        actual_distance_km !== null
                            ? `${numberFormat.format(actual_distance_km)} km`
                            : noneValue
                    }
                />
                <Field
                    label="Start Odometer"
                    value={
                        trip.start_odometer_km !== null
                            ? numberFormat.format(trip.start_odometer_km)
                            : noneValue
                    }
                />
                <Field
                    label="End Odometer"
                    value={
                        trip.end_odometer_km !== null
                            ? numberFormat.format(trip.end_odometer_km)
                            : noneValue
                    }
                />
                <Field label="Dispatched" value={formatDateTime(trip.dispatched_at)} />
                <Field
                    label={trip.status === "cancelled" ? "Cancelled" : "Completed"}
                    value={formatDateTime(
                        trip.status === "cancelled" ? trip.cancelled_at : trip.completed_at,
                    )}
                />
            </dl>

            {fuel_logs.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        Fuel Logs
                    </h3>
                    <ul className="flex flex-col gap-1">
                        {fuel_logs.map((log) => (
                            <li
                                key={log.id}
                                className="flex items-center justify-between rounded-[4px] border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm"
                            >
                                <span>{numberFormat.format(log.liters)} L</span>
                                <span className="text-gray-500">
                                    {numberFormat.format(log.cost)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {expenses.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        Expenses
                    </h3>
                    <ul className="flex flex-col gap-1">
                        {expenses.map((expense) => (
                            <li
                                key={expense.id}
                                className="flex items-center justify-between rounded-[4px] border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm"
                            >
                                <span className="capitalize">{expense.type}</span>
                                <span className="text-gray-500">
                                    {numberFormat.format(expense.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
