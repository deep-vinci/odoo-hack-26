import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { FuelExpenseView } from "@/features/fuel-expenses/components/fuel-expense-view";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Fuel & Expenses",
};

export default function FuelExpensesPage() {
  return (
    <DashboardShell
      headerTitle={<h1 className={design.pageTitle}>Fuel &amp; Expenses</h1>}
    >
      <FuelExpenseView />
    </DashboardShell>
  );
}
