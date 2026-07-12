import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <DashboardShell
      headerTitle={<h1 className={design.pageTitle}>Analytics</h1>}
    >
      <AnalyticsView />
    </DashboardShell>
  );
}
