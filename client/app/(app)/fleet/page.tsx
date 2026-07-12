import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { VehiclesTable } from "@/features/fleet/components/vehicles-table";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Fleet",
};

export default function FleetPage() {
  return (
    <DashboardShell headerTitle={<h1 className={design.pageTitle}>Fleet</h1>}>
      <VehiclesTable />
    </DashboardShell>
  );
}
