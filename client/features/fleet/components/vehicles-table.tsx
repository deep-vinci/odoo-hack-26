"use client";

import { useState, useSyncExternalStore } from "react";
import {
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    ProhibitIcon,
    ArrowCounterClockwiseIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill, type PillVariant } from "@/components/ui/pill";
import { toast } from "@/components/ui/toast";
import {
    VEHICLE_STATUSES,
    VEHICLE_TYPES,
    type Vehicle,
    type VehicleStatus,
    type VehicleType,
} from "@/features/fleet/api";
import {
    useChangeVehicleStatus,
    useDeleteVehicle,
    useVehicles,
} from "@/features/fleet/use-vehicles";
import { VehicleFormModal } from "@/features/fleet/components/vehicle-form-modal";
import { getStoredUserRole } from "@/lib/auth-storage";

const TYPE_LABELS: Record<VehicleType, string> = {
    truck: "Truck",
    van: "Van",
    mini_truck: "Mini Truck",
    trailer: "Trailer",
    other: "Other",
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
    available: "Available",
    on_trip: "On Trip",
    in_shop: "In Shop",
    retired: "Retired",
};

const STATUS_VARIANTS: Record<VehicleStatus, PillVariant> = {
    available: "available",
    on_trip: "info",
    in_shop: "pending",
    retired: "danger",
};

const typeFilterOptions = [
    { value: "", label: "All" },
    ...VEHICLE_TYPES.map((type) => ({ value: type, label: TYPE_LABELS[type] })),
];

const statusFilterOptions = [
    { value: "", label: "All" },
    ...VEHICLE_STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
    })),
];

const numberFormat = new Intl.NumberFormat("en-IN");

function subscribeRole(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

const LIMIT = 10;

export function VehiclesTable() {
    const role = useSyncExternalStore(
        subscribeRole,
        getStoredUserRole,
        () => null,
    );
    const isManager = role === "fleet_manager";

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

    const { data, isLoading } = useVehicles({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        type: (typeFilter as VehicleType) || undefined,
        status: (statusFilter as VehicleStatus) || undefined,
    });

    const changeStatus = useChangeVehicleStatus();
    const deleteVehicle = useDeleteVehicle();

    const vehicles = data?.vehicles ?? [];
    const total = data?.pagination.total ?? 0;

    function openCreate() {
        setEditingVehicle(null);
        setFormOpen(true);
    }

    function openEdit(vehicle: Vehicle) {
        setEditingVehicle(vehicle);
        setFormOpen(true);
    }

    async function handleStatus(vehicle: Vehicle, status: VehicleStatus) {
        try {
            await changeStatus.mutateAsync({ id: vehicle.id, status });
            toast.success(
                status === "retired"
                    ? `${vehicle.name} retired.`
                    : `${vehicle.name} set to available.`,
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to change status. Please try again.",
            );
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteVehicle.mutateAsync(deleteTarget.id);
            toast.success(`${deleteTarget.name} deleted.`);
            setDeleteTarget(null);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to delete vehicle. Please try again.",
            );
        }
    }

    const buildColumns = (): DataTableColumn<Vehicle>[] => {
        const base: DataTableColumn<Vehicle>[] = [
            {
                key: "registration_number",
                header: "Reg. No. (Unique)",
                render: (row) => (
                    <span className="font-medium">
                        {row.registration_number}
                    </span>
                ),
            },
            { key: "name", header: "Name/Model", render: (row) => row.name },
            {
                key: "type",
                header: "Type",
                render: (row) => TYPE_LABELS[row.type],
            },
            {
                key: "max_load_capacity_kg",
                header: "Capacity",
                render: (row) =>
                    `${numberFormat.format(row.max_load_capacity_kg)} kg`,
            },
            {
                key: "odometer_km",
                header: "Odometer",
                render: (row) => numberFormat.format(row.odometer_km),
            },
            {
                key: "acquisition_cost",
                header: "Acq. Cost",
                render: (row) => numberFormat.format(row.acquisition_cost),
            },
            {
                key: "region",
                header: "Region",
                render: (row) => row.region ?? "—",
            },
            {
                key: "status",
                header: "Status",
                render: (row) => (
                    <Pill variant={STATUS_VARIANTS[row.status]}>
                        {STATUS_LABELS[row.status]}
                    </Pill>
                ),
            },
        ];

        if (!isManager) return base;

        base.push({
            key: "actions",
            header: "",
            className: "w-12 text-right",
            render: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label={`Actions for ${row.registration_number}`}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[4px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20"
                    >
                        <DotsThreeVerticalIcon size={18} weight="bold" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem onClick={() => openEdit(row)}>
                            <PencilSimpleIcon size={16} />
                            Edit
                        </DropdownMenuItem>
                        {row.status === "available" ? (
                            <DropdownMenuItem
                                onClick={() => handleStatus(row, "retired")}
                            >
                                <ProhibitIcon size={16} />
                                Retire
                            </DropdownMenuItem>
                        ) : null}
                        {row.status === "retired" ? (
                            <DropdownMenuItem
                                onClick={() => handleStatus(row, "available")}
                            >
                                <ArrowCounterClockwiseIcon size={16} />
                                Set available
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(row)}
                        >
                            <TrashIcon size={16} />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        });

        return base;
    };

    const columns = buildColumns();

    return (
        <>
            <ResourceListPage
                title="Vehicle Registry"
                columns={columns}
                items={vehicles}
                total={total}
                page={page}
                limit={LIMIT}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No vehicles found."
                searchPlaceholder="Search reg. no or name…"
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={
                    <>
                        <FilterDropdown
                            label="Type: All"
                            value={typeFilter}
                            options={typeFilterOptions}
                            onChange={(value) => {
                                setTypeFilter(value);
                                setPage(1);
                            }}
                            selectedLabel={`Type: ${
                                typeFilterOptions.find(
                                    (o) => o.value === typeFilter,
                                )?.label ?? "All"
                            }`}
                            triggerClassName="w-[160px]"
                        />
                        <FilterDropdown
                            label="Status: All"
                            value={statusFilter}
                            options={statusFilterOptions}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                            selectedLabel={`Status: ${
                                statusFilterOptions.find(
                                    (o) => o.value === statusFilter,
                                )?.label ?? "All"
                            }`}
                            triggerClassName="w-[170px]"
                        />
                    </>
                }
                primaryAction={
                    isManager
                        ? { label: "Add Vehicle", onClick: openCreate }
                        : undefined
                }
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: Registration No. must be unique • Retired/In Shop vehicles
                are hidden from Trip Dispatcher
            </p>

            {isManager ? (
                <>
                    <VehicleFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        vehicle={editingVehicle}
                    />
                    <ConfirmDialog
                        open={deleteTarget !== null}
                        title="Delete vehicle"
                        description={
                            deleteTarget
                                ? `Delete ${deleteTarget.name} (${deleteTarget.registration_number})? This cannot be undone. Vehicles with trips or logs cannot be deleted — retire them instead.`
                                : ""
                        }
                        confirmLabel="Delete"
                        danger
                        loading={deleteVehicle.isPending}
                        onOpenChange={(open) => {
                            if (!open) setDeleteTarget(null);
                        }}
                        onConfirm={handleDelete}
                    />
                </>
            ) : null}
        </>
    );
}
