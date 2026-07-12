import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { DriversTable } from "@/features/drivers/components/drivers-table";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Drivers",
};

export default function DriversPage() {
  return (
    <DashboardShell headerTitle={<h1 className={design.pageTitle}>Drivers</h1>}>
      <DriversTable />
    </DashboardShell>
  );
}
