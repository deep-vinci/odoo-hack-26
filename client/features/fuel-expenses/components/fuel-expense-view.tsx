"use client";

import { useMemo, useRef, useState } from "react";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { KPICard } from "@/components/ui/kpi-card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { design } from "@/lib/design";
import { FuelExpenseForm } from "@/features/fuel-expenses/components/fuel-expense-form";
import { FuelLogTable } from "@/features/fuel-expenses/components/fuel-log-table";
import {
    fuelExpenseTrips,
    fuelExpenseVehicles,
    initialExpenses,
    initialFuelLogs,
    type Expense,
    type ExpenseType,
    type FuelLog,
} from "@/features/fuel-expenses/types";
import { initialMaintenanceRecords } from "@/features/maintenance/types";

const maintenanceCost = initialMaintenanceRecords.reduce((sum, record) => sum + record.cost, 0);

export function FuelExpenseView() {
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const fuelSequenceRef = useRef(initialFuelLogs.length + 1);
    const expenseSequenceRef = useRef(initialExpenses.length + 1);
    const [recordOpen, setRecordOpen] = useState(false);

    const fuelCost = useMemo(() => fuelLogs.reduce((sum, log) => sum + log.cost, 0), [fuelLogs]);
    const expenseCost = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
    const totalOperationalCost = fuelCost + expenseCost + maintenanceCost;

    function handleLogFuel(entry: {
        vehicleId: string;
        tripId: string | null;
        liters: number;
        cost: number;
        date: string;
    }) {
        const id = `f${fuelSequenceRef.current}`;
        fuelSequenceRef.current += 1;
        setFuelLogs((prev) => [{ id, ...entry }, ...prev]);
    }

    function handleAddExpense(entry: {
        vehicleId: string;
        tripId: string | null;
        type: ExpenseType;
        amount: number;
        note: string;
        date: string;
    }) {
        const id = `e${expenseSequenceRef.current}`;
        expenseSequenceRef.current += 1;
        setExpenses((prev) => [{ id, ...entry }, ...prev]);
    }

    const stats = [
        { label: "Fuel Cost", value: fuelCost },
        { label: "Toll & Misc Expenses", value: expenseCost },
        { label: "Maintenance (Linked)", value: maintenanceCost },
    ];

    return (
        <>
            <div className="px-8 pt-6">
                <HorizontalScrollRow className="flex min-w-0 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="w-56 shrink-0">
                            <KPICard label={stat.label} value={stat.value} prefix="₹" />
                        </div>
                    ))}
                    <div className="w-64 shrink-0">
                        <div className={cn(design.card, "flex flex-col p-5")}>
                            <span className="flex-1 text-sm font-medium text-gray-500">
                                Total Operational Cost (auto)
                            </span>
                            <p className="mt-5 text-[28px] leading-none font-semibold tabular-nums text-[#1f2430]">
                                ₹{totalOperationalCost.toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>
                </HorizontalScrollRow>
            </div>

            <FuelLogTable
                logs={fuelLogs}
                vehicles={fuelExpenseVehicles}
                onRecordCost={() => setRecordOpen(true)}
            />

            <Modal
                open={recordOpen}
                onOpenChange={setRecordOpen}
                title="Record Cost"
                description="Log a fuel fill-up or a toll / misc expense."
            >
                <FuelExpenseForm
                    vehicles={fuelExpenseVehicles}
                    trips={fuelExpenseTrips}
                    onLogFuel={handleLogFuel}
                    onAddExpense={handleAddExpense}
                    onClose={() => setRecordOpen(false)}
                />
            </Modal>
        </>
    );
}
