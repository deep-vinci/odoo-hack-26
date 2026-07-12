"use client";

import { DropIcon, ReceiptIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    expenseTypeLabel,
    type ExpenseType,
    type FuelExpenseTrip,
    type FuelExpenseVehicle,
} from "@/features/fuel-expenses/types";

type FormMode = "fuel" | "expense";

type FuelFormState = {
    vehicleId: string;
    tripId: string;
    liters: string;
    cost: string;
    date: string;
};

type ExpenseFormState = {
    vehicleId: string;
    tripId: string;
    type: ExpenseType;
    amount: string;
    note: string;
    date: string;
};

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function emptyFuelForm(): FuelFormState {
    return { vehicleId: "", tripId: "", liters: "", cost: "", date: todayIso() };
}

function emptyExpenseForm(): ExpenseFormState {
    return { vehicleId: "", tripId: "", type: "toll", amount: "", note: "", date: todayIso() };
}

const expenseTypeOptions = (Object.keys(expenseTypeLabel) as ExpenseType[]).map((type) => ({
    value: type,
    label: expenseTypeLabel[type],
}));

type FuelExpenseFormProps = {
    vehicles: FuelExpenseVehicle[];
    trips: FuelExpenseTrip[];
    onLogFuel: (entry: { vehicleId: string; tripId: string | null; liters: number; cost: number; date: string }) => void;
    onAddExpense: (entry: { vehicleId: string; tripId: string | null; type: ExpenseType; amount: number; note: string; date: string }) => void;
    onClose: () => void;
};

export function FuelExpenseForm({ vehicles, trips, onLogFuel, onAddExpense, onClose }: FuelExpenseFormProps) {
    const [mode, setMode] = useState<FormMode>("fuel");
    const [fuelForm, setFuelForm] = useState<FuelFormState>(emptyFuelForm);
    const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm);

    const vehicleOptions = vehicles.map((v) => ({ value: v.id, label: v.name }));

    const activeVehicleId = mode === "fuel" ? fuelForm.vehicleId : expenseForm.vehicleId;
    const tripOptions = [
        { value: "", label: "No trip" },
        ...trips
            .filter((t) => !activeVehicleId || t.vehicleId === activeVehicleId)
            .map((t) => ({ value: t.id, label: t.id })),
    ];

    const fuelLiters = Number(fuelForm.liters) || 0;
    const fuelCost = Number(fuelForm.cost) || 0;
    const canLogFuel =
        fuelForm.vehicleId.length > 0 && fuelLiters > 0 && fuelCost > 0 && fuelForm.date.length > 0;

    const expenseAmount = Number(expenseForm.amount) || 0;
    const canAddExpense =
        expenseForm.vehicleId.length > 0 && expenseAmount > 0 && expenseForm.date.length > 0;

    function updateFuel<K extends keyof FuelFormState>(key: K, value: FuelFormState[K]) {
        setFuelForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateExpense<K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) {
        setExpenseForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleLogFuel() {
        if (!canLogFuel) return;
        onLogFuel({
            vehicleId: fuelForm.vehicleId,
            tripId: fuelForm.tripId || null,
            liters: fuelLiters,
            cost: fuelCost,
            date: fuelForm.date,
        });
        setFuelForm(emptyFuelForm());
        onClose();
    }

    function handleAddExpense() {
        if (!canAddExpense) return;
        onAddExpense({
            vehicleId: expenseForm.vehicleId,
            tripId: expenseForm.tripId || null,
            type: expenseForm.type,
            amount: expenseAmount,
            note: expenseForm.note.trim(),
            date: expenseForm.date,
        });
        setExpenseForm(emptyExpenseForm());
        onClose();
    }

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={mode === "fuel" ? "primary" : "secondary"}
                    size="sm"
                    fullWidth
                    active={mode === "fuel"}
                    onClick={() => setMode("fuel")}
                >
                    <DropIcon size={16} weight={mode === "fuel" ? "fill" : "regular"} />
                    Log Fuel
                </Button>
                <Button
                    type="button"
                    variant={mode === "expense" ? "primary" : "secondary"}
                    size="sm"
                    fullWidth
                    active={mode === "expense"}
                    onClick={() => setMode("expense")}
                >
                    <ReceiptIcon size={16} weight={mode === "expense" ? "fill" : "regular"} />
                    Add Expense
                </Button>
            </div>

            {mode === "fuel" ? (
                <>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fuel-vehicle" required>Vehicle</Label>
                        <Combobox
                            id="fuel-vehicle"
                            value={fuelForm.vehicleId}
                            onChange={(value) => updateFuel("vehicleId", value)}
                            placeholder="Select vehicle…"
                            options={vehicleOptions}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fuel-trip">Trip (optional)</Label>
                        <FilterDropdown
                            id="fuel-trip"
                            label="No trip"
                            value={fuelForm.tripId}
                            options={tripOptions}
                            onChange={(value) => updateFuel("tripId", value)}
                            selectedLabel={tripOptions.find((o) => o.value === fuelForm.tripId)?.label ?? "No trip"}
                            triggerClassName="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fuel-liters" required>Liters</Label>
                            <Input
                                id="fuel-liters"
                                type="number"
                                min={0}
                                value={fuelForm.liters}
                                onChange={(e) => updateFuel("liters", e.target.value)}
                                placeholder="e.g. 42"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fuel-cost" required>Fuel Cost</Label>
                            <Input
                                id="fuel-cost"
                                type="number"
                                min={0}
                                value={fuelForm.cost}
                                onChange={(e) => updateFuel("cost", e.target.value)}
                                placeholder="e.g. 3150"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fuel-date" required>Date</Label>
                        <Input
                            id="fuel-date"
                            type="date"
                            value={fuelForm.date}
                            onChange={(e) => updateFuel("date", e.target.value)}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="expense-vehicle" required>Vehicle</Label>
                        <Combobox
                            id="expense-vehicle"
                            value={expenseForm.vehicleId}
                            onChange={(value) => updateExpense("vehicleId", value)}
                            placeholder="Select vehicle…"
                            options={vehicleOptions}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="expense-trip">Trip (optional)</Label>
                            <FilterDropdown
                                id="expense-trip"
                                label="No trip"
                                value={expenseForm.tripId}
                                options={tripOptions}
                                onChange={(value) => updateExpense("tripId", value)}
                                selectedLabel={tripOptions.find((o) => o.value === expenseForm.tripId)?.label ?? "No trip"}
                                triggerClassName="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="expense-type" required>Type</Label>
                            <FilterDropdown
                                id="expense-type"
                                label="Type"
                                value={expenseForm.type}
                                options={expenseTypeOptions}
                                onChange={(value) => updateExpense("type", value as ExpenseType)}
                                selectedLabel={expenseTypeLabel[expenseForm.type]}
                                triggerClassName="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="expense-amount" required>Amount</Label>
                            <Input
                                id="expense-amount"
                                type="number"
                                min={0}
                                value={expenseForm.amount}
                                onChange={(e) => updateExpense("amount", e.target.value)}
                                placeholder="e.g. 340"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="expense-date" required>Date</Label>
                            <Input
                                id="expense-date"
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) => updateExpense("date", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="expense-note">Note</Label>
                        <Input
                            id="expense-note"
                            value={expenseForm.note}
                            onChange={(e) => updateExpense("note", e.target.value)}
                            placeholder="e.g. Expressway toll"
                        />
                    </div>
                </>
            )}

            <p className="text-xs text-gray-500">
                Total Operational Cost is computed automatically from Fuel + Expenses + linked Maintenance.
            </p>

            <div className="mt-1 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                {mode === "fuel" ? (
                    <Button type="button" variant="primary" disabled={!canLogFuel} onClick={handleLogFuel}>
                        Log Fuel
                    </Button>
                ) : (
                    <Button type="button" variant="primary" disabled={!canAddExpense} onClick={handleAddExpense}>
                        Add Expense
                    </Button>
                )}
            </div>
        </div>
    );
}
