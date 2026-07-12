"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KPICard } from "@/components/ui/kpi-card";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { design } from "@/lib/design";
import { ExpenseTable } from "@/features/fuel-expenses/components/expense-table";
import { FuelExpenseForm } from "@/features/fuel-expenses/components/fuel-expense-form";
import { FuelLogTable } from "@/features/fuel-expenses/components/fuel-log-table";
import type { Expense, ExpenseType, FuelLog } from "@/features/fuel-expenses/api";
import {
    useAllVehicles,
    useDeleteExpense,
    useDeleteFuelLog,
    useExpenseList,
    useFuelLogList,
    useOperationalCostSummary,
} from "@/features/fuel-expenses/use-fuel-expenses";

const LIMIT = 10;

type Tab = "fuel" | "expenses";

export function FuelExpenseView() {
    const [tab, setTab] = useState<Tab>("fuel");
    const [fuelPage, setFuelPage] = useState(1);
    const [expensePage, setExpensePage] = useState(1);
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<ExpenseType | "">("");
    const [recordOpen, setRecordOpen] = useState(false);
    const [deletingFuel, setDeletingFuel] = useState<FuelLog | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

    const summary = useOperationalCostSummary();
    const vehiclesQuery = useAllVehicles();

    const fuelQuery = useFuelLogList({
        page: fuelPage,
        limit: LIMIT,
        vehicle_id: vehicleFilter,
        sort_by: "filled_at",
        sort_order: "desc",
    });
    const expenseQuery = useExpenseList({
        page: expensePage,
        limit: LIMIT,
        vehicle_id: vehicleFilter,
        type: typeFilter,
        sort_by: "incurred_at",
        sort_order: "desc",
    });

    const deleteFuel = useDeleteFuelLog();
    const deleteExpense = useDeleteExpense();

    const vehicleOptions = [
        { value: "", label: "All vehicles" },
        ...(vehiclesQuery.data?.vehicles ?? []).map((vehicle) => ({
            value: vehicle.id,
            label: `${vehicle.name}, ${vehicle.registration_number}`,
        })),
    ];

    const stats = [
        { label: "Fuel Cost", value: summary.fuelCost },
        { label: "Toll & Misc Expenses", value: summary.expenseCost },
        { label: "Maintenance (Linked)", value: summary.maintenanceCost },
    ];

    function handleVehicleFilterChange(value: string) {
        setVehicleFilter(value);
        setFuelPage(1);
        setExpensePage(1);
    }

    function handleTypeFilterChange(value: ExpenseType | "") {
        setTypeFilter(value);
        setExpensePage(1);
    }

    async function handleConfirmDeleteFuel() {
        if (!deletingFuel) return;
        try {
            await deleteFuel.mutateAsync(deletingFuel.id);
            toast.success("Fuel log deleted.");
            setDeletingFuel(null);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Unable to delete fuel log.",
            );
        }
    }

    async function handleConfirmDeleteExpense() {
        if (!deletingExpense) return;
        try {
            await deleteExpense.mutateAsync(deletingExpense.id);
            toast.success("Expense deleted.");
            setDeletingExpense(null);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Unable to delete expense.",
            );
        }
    }

    const fuelEmptyMessage = fuelQuery.isError
        ? fuelQuery.error.message
        : "No fuel logs yet.";
    const expenseEmptyMessage = expenseQuery.isError
        ? expenseQuery.error.message
        : "No expenses yet.";

    return (
        <>
            <div className="px-8 pt-6">
                <p className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Operational cost · this month
                </p>
                <div className="grid grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <KPICard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                            prefix="₹"
                            isLoading={summary.isLoading}
                        />
                    ))}
                    <div className={cn(design.card, "flex flex-col p-5")}>
                        <span className="flex-1 text-sm font-medium text-gray-500">
                            Total Operational Cost (auto)
                        </span>
                        <p className="mt-5 text-[28px] leading-none font-semibold tabular-nums text-[#1f2430]">
                            ₹{summary.totalOperationalCost.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>

                <div className={cn(design.tabList, "mt-6")}>
                    <button
                        type="button"
                        className={tab === "fuel" ? design.tabActive : design.tab}
                        onClick={() => setTab("fuel")}
                    >
                        Fuel Logs
                    </button>
                    <button
                        type="button"
                        className={tab === "expenses" ? design.tabActive : design.tab}
                        onClick={() => setTab("expenses")}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {tab === "fuel" ? (
                <FuelLogTable
                    logs={fuelQuery.data?.fuel_logs ?? []}
                    total={fuelQuery.data?.pagination.total ?? 0}
                    page={fuelPage}
                    limit={LIMIT}
                    isLoading={fuelQuery.isLoading}
                    emptyMessage={fuelEmptyMessage}
                    vehicleFilter={vehicleFilter}
                    vehicleOptions={vehicleOptions}
                    onPageChange={setFuelPage}
                    onVehicleFilterChange={handleVehicleFilterChange}
                    onRecordCost={() => setRecordOpen(true)}
                    onDeleteLog={setDeletingFuel}
                />
            ) : (
                <ExpenseTable
                    expenses={expenseQuery.data?.expenses ?? []}
                    total={expenseQuery.data?.pagination.total ?? 0}
                    page={expensePage}
                    limit={LIMIT}
                    isLoading={expenseQuery.isLoading}
                    emptyMessage={expenseEmptyMessage}
                    vehicleFilter={vehicleFilter}
                    vehicleOptions={vehicleOptions}
                    typeFilter={typeFilter}
                    onPageChange={setExpensePage}
                    onVehicleFilterChange={handleVehicleFilterChange}
                    onTypeFilterChange={handleTypeFilterChange}
                    onRecordCost={() => setRecordOpen(true)}
                    onDeleteExpense={setDeletingExpense}
                />
            )}

            <Modal
                open={recordOpen}
                onOpenChange={setRecordOpen}
                title="Record Cost"
                description="Log a fuel fill-up or a toll / misc expense."
            >
                <FuelExpenseForm onClose={() => setRecordOpen(false)} />
            </Modal>

            <ConfirmDialog
                open={deletingFuel !== null}
                title="Delete fuel log"
                description={
                    deletingFuel
                        ? `Delete this fuel log for ${deletingFuel.vehicle.name}? This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                danger
                loading={deleteFuel.isPending}
                onOpenChange={(open) => {
                    if (!open) setDeletingFuel(null);
                }}
                onConfirm={handleConfirmDeleteFuel}
            />

            <ConfirmDialog
                open={deletingExpense !== null}
                title="Delete expense"
                description={
                    deletingExpense
                        ? `Delete this expense for ${deletingExpense.vehicle.name}? This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                danger
                loading={deleteExpense.isPending}
                onOpenChange={(open) => {
                    if (!open) setDeletingExpense(null);
                }}
                onConfirm={handleConfirmDeleteExpense}
            />
        </>
    );
}
