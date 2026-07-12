import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Trips",
};

export default function TripsPage() {
  return (
    <DashboardShell headerTitle={<h1 className={design.pageTitle}>Trips</h1>}>
      <div className={design.pageContainer + " px-4 py-6 sm:px-6"} />
    </DashboardShell>
  );
}
