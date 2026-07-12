"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import type { TripListItem, TripStatus } from "@/features/trips/api";
import { TripCompleteModal } from "@/features/trips/components/trip-complete-modal";
import { TripDetail } from "@/features/trips/components/trip-detail";
import { TripDispatchModal } from "@/features/trips/components/trip-dispatch-modal";
import { TripFormModal } from "@/features/trips/components/trip-form-modal";
import { TripsTable } from "@/features/trips/components/trips-table";
import { useCancelTrip, useTrip, useTrips } from "@/features/trips/use-trips";
import { getStoredUserRole } from "@/lib/auth-storage";

const LIMIT = 10;

function subscribeRole(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

type ActionTarget = {
    id: string;
    trip_number: string;
};

export function TripsView() {
    const role = useSyncExternalStore(subscribeRole, getStoredUserRole, () => null);
    const canManage = role === "fleet_manager" || role === "dispatcher";

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<TripListItem | null>(null);
    const [dispatchTarget, setDispatchTarget] = useState<ActionTarget | null>(null);
    const [completeTarget, setCompleteTarget] = useState<
        (ActionTarget & { start_odometer_km: number | null }) | null
    >(null);
    const [cancelTarget, setCancelTarget] = useState<ActionTarget | null>(null);

    const { data, isLoading } = useTrips({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        status: (statusFilter as TripStatus) || undefined,
    });

    const selectedDetail = useTrip(selectedTrip?.id ?? null);
    const cancelMutation = useCancelTrip();

    const trips = data?.trips ?? [];
    const total = data?.pagination.total ?? 0;

    const detailStatus = selectedDetail.data?.trip.status ?? selectedTrip?.status;
    const detailStartOdometer = selectedDetail.data?.trip.start_odometer_km ?? null;

    function handleDispatch() {
        if (!selectedTrip) return;
        setDispatchTarget({ id: selectedTrip.id, trip_number: selectedTrip.trip_number });
        setSelectedTrip(null);
    }

    function handleComplete() {
        if (!selectedTrip) return;
        setCompleteTarget({
            id: selectedTrip.id,
            trip_number: selectedTrip.trip_number,
            start_odometer_km: detailStartOdometer,
        });
        setSelectedTrip(null);
    }

    function handleCancel() {
        if (!selectedTrip) return;
        setCancelTarget({ id: selectedTrip.id, trip_number: selectedTrip.trip_number });
        setSelectedTrip(null);
    }

    async function confirmCancel() {
        if (!cancelTarget) return;
        try {
            const result = await cancelMutation.mutateAsync({ id: cancelTarget.id });
            toast.success(`Trip ${result.trip.trip_number} cancelled.`);
            setCancelTarget(null);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel trip. Please try again.",
            );
        }
    }

    return (
        <>
            <TripsTable
                trips={trips}
                total={total}
                page={page}
                limit={LIMIT}
                isLoading={isLoading}
                search={search}
                statusFilter={statusFilter}
                onPageChange={setPage}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onStatusChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                }}
                onSelectTrip={(trip) => setSelectedTrip(trip)}
                onNewTrip={canManage ? () => setCreateOpen(true) : undefined}
            />

            {canManage ? (
                <>
                    <TripFormModal open={createOpen} onOpenChange={setCreateOpen} />
                    <TripDispatchModal
                        trip={dispatchTarget}
                        open={dispatchTarget !== null}
                        onOpenChange={(open) => {
                            if (!open) setDispatchTarget(null);
                        }}
                    />
                    <TripCompleteModal
                        trip={completeTarget}
                        open={completeTarget !== null}
                        onOpenChange={(open) => {
                            if (!open) setCompleteTarget(null);
                        }}
                    />
                    <ConfirmDialog
                        open={cancelTarget !== null}
                        title="Cancel trip"
                        description={
                            cancelTarget
                                ? `Cancel ${cancelTarget.trip_number}? Any assigned vehicle and driver will be released. This cannot be undone.`
                                : ""
                        }
                        confirmLabel="Cancel trip"
                        danger
                        loading={cancelMutation.isPending}
                        onOpenChange={(open) => {
                            if (!open) setCancelTarget(null);
                        }}
                        onConfirm={confirmCancel}
                    />
                </>
            ) : null}

            <Modal
                className="max-w-150"
                open={selectedTrip !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedTrip(null);
                }}
                title={selectedTrip ? selectedTrip.trip_number : ""}
                description={
                    selectedTrip
                        ? `${selectedTrip.source} → ${selectedTrip.destination}`
                        : undefined
                }
                footer={
                    selectedTrip &&
                    canManage &&
                    (detailStatus === "draft" || detailStatus === "dispatched") ? (
                        <>
                            {detailStatus === "draft" ? (
                                <Button type="button" variant="primary" onClick={handleDispatch}>
                                    Dispatch
                                </Button>
                            ) : null}
                            {detailStatus === "dispatched" ? (
                                <Button type="button" variant="success" onClick={handleComplete}>
                                    Complete Trip
                                </Button>
                            ) : null}
                            <Button type="button" variant="danger" onClick={handleCancel}>
                                Cancel Trip
                            </Button>
                        </>
                    ) : undefined
                }
            >
                {selectedTrip ? <TripDetail tripId={selectedTrip.id} /> : null}
            </Modal>
        </>
    );
}
