"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import type { DataTableColumn } from "@/components/data-table/data-table";
import { ResourceListPage } from "@/components/data-table/resource-list-page";
import { DropdownPanel } from "@/components/ui/dropdown-panel";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Pill } from "@/components/ui/pill";
import { EXPENSE_TYPES, type Expense, type ExpenseType } from "@/features/fuel-expenses/api";
import {
    expenseTypeLabel,
    expenseTypeVariant,
    formatAmount,
    formatFuelExpenseDate,
} from "@/features/fuel-expenses/types";

type VehicleFilterOption = {
    value: string;
    label: string;
};

const typeFilterOptions = [
    { value: "", label: "All" },
    ...EXPENSE_TYPES.map((type) => ({ value: type, label: expenseTypeLabel[type] })),
];

type ExpenseTableProps = {
    expenses: Expense[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    emptyMessage: string;
    vehicleFilter: string;
    vehicleOptions: VehicleFilterOption[];
    typeFilter: ExpenseType | "";
    onPageChange: (page: number) => void;
    onVehicleFilterChange: (value: string) => void;
    onTypeFilterChange: (value: ExpenseType | "") => void;
    onRecordCost: () => void;
    onDeleteExpense: (expense: Expense) => void;
};

export function ExpenseTable({
    expenses,
    total,
    page,
    limit,
    isLoading,
    emptyMessage,
    vehicleFilter,
    vehicleOptions,
    typeFilter,
    onPageChange,
    onVehicleFilterChange,
    onTypeFilterChange,
    onRecordCost,
    onDeleteExpense,
}: ExpenseTableProps) {
    const columns: DataTableColumn<Expense>[] = useMemo(
        () => [
            {
                key: "vehicle",
                header: "Vehicle",
                render: (row) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{row.vehicle.name}</span>
                        <span className="text-xs text-gray-500">
                            {row.vehicle.registration_number}
                        </span>
                    </div>
                ),
            },
            {
                key: "trip",
                header: "Trip",
                render: (row) =>
                    row.trip ? (
                        row.trip.trip_number
                    ) : (
                        <span className="text-gray-400">None</span>
                    ),
            },
            {
                key: "type",
                header: "Type",
                render: (row) => (
                    <Pill variant={expenseTypeVariant[row.type]}>
                        {expenseTypeLabel[row.type]}
                    </Pill>
                ),
            },
            {
                key: "note",
                header: "Note",
                render: (row) =>
                    row.note ? (
                        <span className="text-gray-700">{row.note}</span>
                    ) : (
                        <span className="text-gray-400">—</span>
                    ),
            },
            { key: "date", header: "Date", render: (row) => formatFuelExpenseDate(row.incurred_at) },
            {
                key: "amount",
                header: "Amount",
                render: (row) => (
                    <span className="tabular-nums">₹{formatAmount(row.amount)}</span>
                ),
            },
            {
                key: "actions",
                header: "",
                className: "w-16 text-right",
                render: (row) => (
                    <div className="flex justify-end">
                        <DropdownPanel
                            triggerLabel={`Actions for ${row.vehicle.name} expense`}
                            actions={[
                                {
                                    label: "Delete",
                                    icon: <TrashIcon size={16} />,
                                    variant: "destructive",
                                    onSelect: () => onDeleteExpense(row),
                                },
                            ]}
                        />
                    </div>
                ),
            },
        ],
        [onDeleteExpense],
    );

    const selectedVehicleLabel =
        vehicleOptions.find((o) => o.value === vehicleFilter)?.label ?? "All vehicles";
    const selectedTypeLabel =
        typeFilterOptions.find((o) => o.value === typeFilter)?.label ?? "All";

    return (
        <ResourceListPage
            title="Expenses"
            columns={columns}
            items={expenses}
            total={total}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
            isLoading={isLoading}
            getRowKey={(row) => row.id}
            emptyMessage={emptyMessage}
            filters={
                <>
                    <FilterDropdown
                        label="Vehicle: All"
                        value={vehicleFilter}
                        options={vehicleOptions}
                        onChange={onVehicleFilterChange}
                        selectedLabel={`Vehicle: ${selectedVehicleLabel}`}
                        triggerClassName="w-[220px]"
                        searchable
                    />
                    <FilterDropdown
                        label="Type: All"
                        value={typeFilter}
                        options={typeFilterOptions}
                        onChange={(value) => onTypeFilterChange(value as ExpenseType | "")}
                        selectedLabel={`Type: ${selectedTypeLabel}`}
                        triggerClassName="w-[160px]"
                    />
                </>
            }
            primaryAction={{ label: "Record Cost", onClick: onRecordCost }}
            hideHeader
        />
    );
}
