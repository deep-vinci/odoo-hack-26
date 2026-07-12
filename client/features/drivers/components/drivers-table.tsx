"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
    DotsThreeVerticalIcon,
    PencilSimpleIcon,
    ProhibitIcon,
    ArrowCounterClockwiseIcon,
    MoonIcon,
    SunIcon,
    GaugeIcon,
} from "@phosphor-icons/react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
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
    DRIVER_STATUSES,
    type Driver,
    type DriverStatus,
} from "@/features/drivers/api";
import {
    useChangeDriverStatus,
    useDrivers,
} from "@/features/drivers/use-drivers";
import { DriverFormModal } from "@/features/drivers/components/driver-form-modal";
import { DriverSafetyScoreModal } from "@/features/drivers/components/driver-safety-score-modal";
import { getStoredUserRole } from "@/lib/auth-storage";

const STATUS_LABELS: Record<DriverStatus, string> = {
    available: "Available",
    on_trip: "On Trip",
    off_duty: "Off Duty",
    suspended: "Suspended",
};

const STATUS_VARIANTS: Record<DriverStatus, PillVariant> = {
    available: "available",
    on_trip: "info",
    off_duty: "inactive",
    suspended: "danger",
};

const statusFilterOptions = [
    { value: "", label: "All" },
    ...DRIVER_STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
    })),
];

const expiryFormatter = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
});

function formatExpiry(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return expiryFormatter.format(date);
}

function subscribeRole(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

const LIMIT = 10;

export function DriversTable() {
    const role = useSyncExternalStore(
        subscribeRole,
        getStoredUserRole,
        () => null,
    );
    const canManage = role === "fleet_manager" || role === "safety_officer";
    const canScore = role === "safety_officer";
    const showActions = canManage || canScore;

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [scoreTarget, setScoreTarget] = useState<Driver | null>(null);

    const { data, isLoading } = useDrivers({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        status: (statusFilter as DriverStatus) || undefined,
    });

    const changeStatus = useChangeDriverStatus();

    const drivers = data?.drivers ?? [];
    const total = data?.pagination.total ?? 0;

    function openCreate() {
        setEditingDriver(null);
        setFormOpen(true);
    }

    function openEdit(driver: Driver) {
        setEditingDriver(driver);
        setFormOpen(true);
    }

    const handleStatus = useCallback(
        async (driver: Driver, status: DriverStatus) => {
            try {
                await changeStatus.mutateAsync({ id: driver.id, status });
                toast.success(`${driver.name} set to ${STATUS_LABELS[status]}.`);
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "Unable to change status. Please try again.",
                );
            }
        },
        [changeStatus],
    );

    const columns = useMemo<DataTableColumn<Driver>[]>(() => {
        const base: DataTableColumn<Driver>[] = [
            {
                key: "name",
                header: "Driver",
                render: (row) => (
                    <span className="font-medium">{row.name}</span>
                ),
            },
            {
                key: "license_number",
                header: "License No.",
                render: (row) => row.license_number,
            },
            {
                key: "license_category",
                header: "Category",
                render: (row) => row.license_category,
            },
            {
                key: "license_expiry_date",
                header: "Expiry",
                render: (row) =>
                    row.license_expired ? (
                        <span className="font-medium text-red-600">
                            {formatExpiry(row.license_expiry_date)} · Expired
                        </span>
                    ) : (
                        formatExpiry(row.license_expiry_date)
                    ),
            },
            {
                key: "contact_number",
                header: "Contact",
                render: (row) => row.contact_number,
            },
            {
                key: "safety_score",
                header: "Safety Score",
                render: (row) => (
                    <span className="font-medium tabular-nums">
                        {row.safety_score}
                    </span>
                ),
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

        if (!showActions) return base;

        base.push({
            key: "actions",
            header: "",
            className: "w-12 text-right",
            render: (row) => {
                const managed = row.status === "on_trip";
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label={`Actions for ${row.name}`}
                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[4px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20"
                        >
                            <DotsThreeVerticalIcon size={18} weight="bold" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                            {canManage ? (
                                <DropdownMenuItem onClick={() => openEdit(row)}>
                                    <PencilSimpleIcon size={16} />
                                    Edit
                                </DropdownMenuItem>
                            ) : null}
                            {canScore ? (
                                <DropdownMenuItem
                                    onClick={() => setScoreTarget(row)}
                                >
                                    <GaugeIcon size={16} />
                                    Update safety score
                                </DropdownMenuItem>
                            ) : null}
                            {canManage && !managed ? (
                                <>
                                    <DropdownMenuSeparator />
                                    {row.status === "available" ? (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleStatus(row, "off_duty")
                                            }
                                        >
                                            <MoonIcon size={16} />
                                            Set off duty
                                        </DropdownMenuItem>
                                    ) : null}
                                    {row.status === "off_duty" ? (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleStatus(row, "available")
                                            }
                                        >
                                            <SunIcon size={16} />
                                            Set available
                                        </DropdownMenuItem>
                                    ) : null}
                                    {row.status === "suspended" ? (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleStatus(row, "available")
                                            }
                                        >
                                            <ArrowCounterClockwiseIcon
                                                size={16}
                                            />
                                            Reactivate
                                        </DropdownMenuItem>
                                    ) : null}
                                    {row.status !== "suspended" ? (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                handleStatus(row, "suspended")
                                            }
                                        >
                                            <ProhibitIcon size={16} />
                                            Suspend
                                        </DropdownMenuItem>
                                    ) : null}
                                </>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        });

        return base;
    }, [showActions, canManage, canScore, handleStatus]);

    return (
        <>
            <ResourceListPage
                title="Drivers"
                columns={columns}
                items={drivers}
                total={total}
                page={page}
                limit={LIMIT}
                onPageChange={setPage}
                getRowKey={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No drivers found."
                searchPlaceholder="Search name or license no…"
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={
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
                        triggerClassName="w-[180px]"
                    />
                }
                primaryAction={
                    canManage
                        ? { label: "Add Driver", onClick: openCreate }
                        : undefined
                }
                hideHeader
            />
            <p className="px-8 pb-6 text-xs text-gray-500">
                Rule: Expired license or Suspended status → blocked from trip
                assignment
            </p>

            {canManage ? (
                <DriverFormModal
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    driver={editingDriver}
                />
            ) : null}
            {canScore ? (
                <DriverSafetyScoreModal
                    open={scoreTarget !== null}
                    onOpenChange={(open) => {
                        if (!open) setScoreTarget(null);
                    }}
                    driver={scoreTarget}
                />
            ) : null}
        </>
    );
}
