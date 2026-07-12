import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { TripsView } from "@/features/trips/components/trips-view";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Trips",
};

export default function TripsPage() {
  return (
    <DashboardShell headerTitle={<h1 className={design.pageTitle}>Trips</h1>}>
      <TripsView />
    </DashboardShell>
  );
}
