"use client";

import { DropIcon, ReceiptIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { EXPENSE_TYPES, type ExpenseType } from "@/features/fuel-expenses/api";
import { expenseTypeLabel } from "@/features/fuel-expenses/types";
import {
    useAllVehicles,
    useCreateExpense,
    useCreateFuelLog,
    useVehicleTrips,
} from "@/features/fuel-expenses/use-fuel-expenses";

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

const expenseTypeOptions = EXPENSE_TYPES.map((type) => ({
    value: type,
    label: expenseTypeLabel[type],
}));

type FuelExpenseFormProps = {
    onClose: () => void;
};

export function FuelExpenseForm({ onClose }: FuelExpenseFormProps) {
    const [mode, setMode] = useState<FormMode>("fuel");
    const [fuelForm, setFuelForm] = useState<FuelFormState>(emptyFuelForm);
    const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm);

    const vehiclesQuery = useAllVehicles();
    const createFuel = useCreateFuelLog();
    const createExpenseMutation = useCreateExpense();
    const loading = createFuel.isPending || createExpenseMutation.isPending;

    const activeVehicleId = mode === "fuel" ? fuelForm.vehicleId : expenseForm.vehicleId;
    const tripsQuery = useVehicleTrips(activeVehicleId);

    const vehicleOptions = (vehiclesQuery.data?.vehicles ?? []).map((vehicle) => ({
        value: vehicle.id,
        label: `${vehicle.name}, ${vehicle.registration_number}`,
    }));

    const tripOptions = [
        { value: "", label: "No trip" },
        ...(tripsQuery.data?.trips ?? []).map((trip) => ({
            value: trip.id,
            label: trip.trip_number,
        })),
    ];

    const fuelLiters = Number(fuelForm.liters) || 0;
    const fuelCost = Number(fuelForm.cost) || 0;
    const canLogFuel =
        fuelForm.vehicleId.length > 0 && fuelLiters > 0 && fuelCost > 0 && fuelForm.date.length > 0;

    const expenseAmount = Number(expenseForm.amount) || 0;
    const canAddExpense =
        expenseForm.vehicleId.length > 0 && expenseAmount > 0 && expenseForm.date.length > 0;

    function updateFuel<K extends keyof FuelFormState>(key: K, value: FuelFormState[K]) {
        setFuelForm((prev) =>
            key === "vehicleId" ? { ...prev, vehicleId: value, tripId: "" } : { ...prev, [key]: value },
        );
    }

    function updateExpense<K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) {
        setExpenseForm((prev) =>
            key === "vehicleId" ? { ...prev, vehicleId: value, tripId: "" } : { ...prev, [key]: value },
        );
    }

    async function handleLogFuel() {
        if (!canLogFuel) return;
        try {
            await createFuel.mutateAsync({
                vehicle_id: fuelForm.vehicleId,
                trip_id: fuelForm.tripId || null,
                liters: fuelLiters,
                cost: fuelCost,
                filled_at: fuelForm.date || null,
                odometer_km: null,
            });
            toast.success("Fuel log recorded.");
            setFuelForm(emptyFuelForm());
            onClose();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Unable to log fuel. Please try again.",
            );
        }
    }

    async function handleAddExpense() {
        if (!canAddExpense) return;
        const note = expenseForm.note.trim();
        try {
            await createExpenseMutation.mutateAsync({
                vehicle_id: expenseForm.vehicleId,
                trip_id: expenseForm.tripId || null,
                type: expenseForm.type,
                amount: expenseAmount,
                note: note ? note : null,
                incurred_at: expenseForm.date || null,
            });
            toast.success("Expense recorded.");
            setExpenseForm(emptyExpenseForm());
            onClose();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Unable to add expense. Please try again.",
            );
        }
    }

    const vehiclePlaceholder = vehiclesQuery.isLoading ? "Loading vehicles…" : "Select vehicle…";
    const tripPlaceholder = tripsQuery.isLoading ? "Loading trips…" : "No trip";
    const selectedFuelTripLabel =
        tripOptions.find((o) => o.value === fuelForm.tripId)?.label ?? tripPlaceholder;
    const selectedExpenseTripLabel =
        tripOptions.find((o) => o.value === expenseForm.tripId)?.label ?? tripPlaceholder;

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
                            placeholder={vehiclePlaceholder}
                            options={vehicleOptions}
                            disabled={loading || vehiclesQuery.isLoading}
                            noOptionsMessage="No vehicles found"
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
                            selectedLabel={selectedFuelTripLabel}
                            triggerClassName="w-full"
                            disabled={loading || !fuelForm.vehicleId || tripsQuery.isLoading}
                            searchable
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fuel-liters" required>Liters</Label>
                            <Input
                                id="fuel-liters"
                                type="number"
                                min={0}
                                step="0.01"
                                value={fuelForm.liters}
                                onChange={(e) => updateFuel("liters", e.target.value)}
                                placeholder="e.g. 42"
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fuel-cost" required>Fuel Cost</Label>
                            <Input
                                id="fuel-cost"
                                type="number"
                                min={0}
                                step="0.01"
                                value={fuelForm.cost}
                                onChange={(e) => updateFuel("cost", e.target.value)}
                                placeholder="e.g. 3150"
                                disabled={loading}
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
                            disabled={loading}
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
                            placeholder={vehiclePlaceholder}
                            options={vehicleOptions}
                            disabled={loading || vehiclesQuery.isLoading}
                            noOptionsMessage="No vehicles found"
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
                                selectedLabel={selectedExpenseTripLabel}
                                triggerClassName="w-full"
                                disabled={loading || !expenseForm.vehicleId || tripsQuery.isLoading}
                                searchable
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
                                disabled={loading}
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
                                step="0.01"
                                value={expenseForm.amount}
                                onChange={(e) => updateExpense("amount", e.target.value)}
                                placeholder="e.g. 340"
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="expense-date" required>Date</Label>
                            <Input
                                id="expense-date"
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) => updateExpense("date", e.target.value)}
                                disabled={loading}
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
                            maxLength={255}
                            disabled={loading}
                        />
                    </div>
                </>
            )}

            <p className="text-xs text-gray-500">
                Total Operational Cost is computed automatically from Fuel + Expenses + linked Maintenance.
            </p>

            <div className="mt-1 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                {mode === "fuel" ? (
                    <Button type="button" variant="primary" disabled={!canLogFuel || loading} onClick={handleLogFuel}>
                        {loading ? <Spinner spinnerClassName="border-white/40 border-t-white" /> : "Log Fuel"}
                    </Button>
                ) : (
                    <Button type="button" variant="primary" disabled={!canAddExpense || loading} onClick={handleAddExpense}>
                        {loading ? <Spinner spinnerClassName="border-white/40 border-t-white" /> : "Add Expense"}
                    </Button>
                )}
            </div>
        </div>
    );
}
