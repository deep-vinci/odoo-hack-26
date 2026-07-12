"use client";

import { useState } from "react";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { KPICard } from "@/components/ui/kpi-card";
import { MaintenanceCompleteModal } from "@/features/maintenance/components/maintenance-complete-modal";
import { MaintenanceFormModal } from "@/features/maintenance/components/maintenance-form-modal";
import { MaintenanceLogTable } from "@/features/maintenance/components/maintenance-log-table";
import type { MaintenanceRecord, MaintenanceStatus } from "@/features/maintenance/api";
import { useMaintenanceList } from "@/features/maintenance/use-maintenance";

const LIMIT = 10;

export function MaintenanceView() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "">("");

    const [addOpen, setAddOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
    const [completingRecord, setCompletingRecord] = useState<MaintenanceRecord | null>(null);

    const query = useMaintenanceList({
        page,
        limit: LIMIT,
        search,
        status: statusFilter,
        sort_by: "opened_at",
        sort_order: "desc",
    });

    const data = query.data;
    const summary = data?.summary;
    const emptyMessage = query.isError
        ? query.error.message
        : "No service records yet.";

    return (
        <>
            <div className="px-8 pt-6">
                <HorizontalScrollRow className="flex min-w-0 gap-4">
                    <div className="w-56 shrink-0">
                        <KPICard
                            label="Open Records"
                            value={summary?.open_count ?? 0}
                            isLoading={query.isLoading}
                        />
                    </div>
                    <div className="w-64 shrink-0">
                        <KPICard
                            label="Maintenance Cost (This Month)"
                            value={summary?.total_cost_this_month ?? 0}
                            prefix="₹"
                            isLoading={query.isLoading}
                        />
                    </div>
                </HorizontalScrollRow>
            </div>

            <MaintenanceLogTable
                records={data?.maintenance_records ?? []}
                total={data?.pagination.total ?? 0}
                page={page}
                limit={LIMIT}
                isLoading={query.isLoading}
                emptyMessage={emptyMessage}
                search={search}
                statusFilter={statusFilter}
                onPageChange={setPage}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onStatusFilterChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                }}
                onAddRecord={() => setAddOpen(true)}
                onEditRecord={setEditingRecord}
                onCompleteRecord={setCompletingRecord}
            />

            <MaintenanceFormModal open={addOpen} onOpenChange={setAddOpen} />

            <MaintenanceFormModal
                open={editingRecord !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingRecord(null);
                }}
                record={editingRecord}
            />

            <MaintenanceCompleteModal
                open={completingRecord !== null}
                onOpenChange={(open) => {
                    if (!open) setCompletingRecord(null);
                }}
                record={completingRecord}
            />
        </>
    );
}
