import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { MaintenanceView } from "@/features/maintenance/components/maintenance-view";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Maintenance",
};

export default function MaintenancePage() {
  return (
    <DashboardShell
      headerTitle={<h1 className={design.pageTitle}>Maintenance</h1>}
    >
      <MaintenanceView />
    </DashboardShell>
  );
}
