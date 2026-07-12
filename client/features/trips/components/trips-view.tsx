"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TripDetail } from "@/features/trips/components/trip-detail";
import {
    TripDispatchForm,
    type TripDispatchValues,
} from "@/features/trips/components/trip-dispatch-form";
import { TripsTable } from "@/features/trips/components/trips-table";
import {
    initialDrivers,
    initialTrips,
    initialVehicles,
    type DispatchDriver,
    type DispatchVehicle,
    type Trip,
} from "@/features/trips/types";

export function TripsView() {
    const [vehicles, setVehicles] = useState<DispatchVehicle[]>(initialVehicles);
    const [drivers, setDrivers] = useState<DispatchDriver[]>(initialDrivers);
    const [trips, setTrips] = useState<Trip[]>(initialTrips);
    const maxTripSeq = Math.max(0, ...initialTrips.map((t) => Number(t.id.replace("TR", "")) || 0));
    const tripSequenceRef = useRef(maxTripSeq + 1);

    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const selectedTrip = selectedTripId ? trips.find((t) => t.id === selectedTripId) ?? null : null;
    const canAct = selectedTrip?.status === "dispatched" || selectedTrip?.status === "draft";

    function handleDispatch(form: TripDispatchValues) {
        const id = `TR${String(tripSequenceRef.current).padStart(3, "0")}`;
        tripSequenceRef.current += 1;

        setTrips((prev) => [
            ...prev,
            {
                id,
                source: form.source,
                destination: form.destination,
                vehicleId: form.vehicleId,
                driverId: form.driverId,
                cargoWeightKg: form.cargoWeightKg,
                plannedDistanceKm: form.plannedDistanceKm,
                status: "dispatched",
                note: `${form.plannedDistanceKm.toLocaleString("en-IN")} km planned`,
            },
        ]);
        setVehicles((prev) =>
            prev.map((v) => (v.id === form.vehicleId ? { ...v, status: "on-trip" } : v)),
        );
        setDrivers((prev) =>
            prev.map((d) => (d.id === form.driverId ? { ...d, status: "on-trip" } : d)),
        );
        setDispatchOpen(false);
    }

    function releaseResources(trip: Trip) {
        setVehicles((prev) =>
            prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: "available" } : v)),
        );
        setDrivers((prev) =>
            prev.map((d) => (d.id === trip.driverId ? { ...d, status: "available" } : d)),
        );
    }

    function handleCancelTrip(tripId: string) {
        const trip = trips.find((t) => t.id === tripId);
        if (!trip) return;
        setTrips((prev) =>
            prev.map((t) => (t.id === tripId ? { ...t, status: "cancelled", note: "Cancelled" } : t)),
        );
        releaseResources(trip);
    }

    function handleCompleteTrip(tripId: string) {
        const trip = trips.find((t) => t.id === tripId);
        if (!trip) return;
        setTrips((prev) =>
            prev.map((t) => (t.id === tripId ? { ...t, status: "completed", note: "Completed" } : t)),
        );
        releaseResources(trip);
    }

    return (
        <>
            <TripsTable
                trips={trips}
                vehicles={vehicles}
                drivers={drivers}
                onDispatchTrip={() => setDispatchOpen(true)}
                onSelectTrip={(trip) => setSelectedTripId(trip.id)}
            />

            <Modal
                open={dispatchOpen}
                onOpenChange={setDispatchOpen}
                title="Dispatch Trip"
                description="Assign an available vehicle and driver to a new trip."
            >
                <TripDispatchForm
                    vehicles={vehicles}
                    drivers={drivers}
                    onSubmit={handleDispatch}
                    onCancel={() => setDispatchOpen(false)}
                />
            </Modal>

            <Modal
                className="max-w-150"
                open={selectedTrip !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedTripId(null);
                }}
                title={selectedTrip ? selectedTrip.id : ""}
                description={selectedTrip ? `${selectedTrip.source} → ${selectedTrip.destination}` : undefined}
                footer={
                    selectedTrip && canAct ? (
                        <>
                            {selectedTrip.status === "dispatched" && (
                                <Button
                                    type="button"
                                    variant="success"
                                    onClick={() => handleCompleteTrip(selectedTrip.id)}
                                >
                                    Complete Trip
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => handleCancelTrip(selectedTrip.id)}
                            >
                                Cancel Trip
                            </Button>
                        </>
                    ) : undefined
                }
            >
                {selectedTrip ? (
                    <TripDetail trip={selectedTrip} vehicles={vehicles} drivers={drivers} />
                ) : null}
            </Modal>
        </>
    );
}
