import type { Metadata } from "next";
import { design } from "@/lib/design";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { RecentTripsTable } from "@/features/dashboard/components/recent-trips-table";

export const metadata: Metadata = {
    title: "Dashboard",
};

export default function DashboardPage() {
    return (
        <DashboardShell
            headerTitle={<h1 className={design.pageTitle}>Dashboard</h1>}
            searchPlaceholder="Search…"
        >
            <div className="flex min-w-0 flex-col gap-6 py-6">
                <DashboardOverview />

                <div className="flex flex-col gap-3">
                    <h2 className={design.sectionTitle + " px-4 sm:px-6"}>
                        Recent Trips
                    </h2>
                    <RecentTripsTable />
                </div>
            </div>
        </DashboardShell>
    );
}
