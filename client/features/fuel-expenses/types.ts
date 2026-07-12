import type { PillVariant } from "@/components/ui/pill";
import type { ExpenseType } from "@/features/fuel-expenses/api";

export const expenseTypeLabel: Record<ExpenseType, string> = {
    toll: "Toll",
    parking: "Parking",
    fine: "Fine",
    misc: "Misc",
};

export const expenseTypeVariant: Record<ExpenseType, PillVariant> = {
    toll: "info",
    parking: "brand-accent",
    fine: "danger",
    misc: "generic",
};

export function formatFuelExpenseDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatAmount(value: number): string {
    return value.toLocaleString("en-IN");
}
