import type { Metadata } from "next";
import { KPICard } from "@/components/ui/kpi-card";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { design } from "@/lib/design";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { DashboardUserBadge } from "@/features/dashboard/components/dashboard-user-badge";
import { RecentTripsTable } from "@/features/dashboard/components/recent-trips-table";

export const metadata: Metadata = {
    title: "Dashboard",
};

const stats = [
    { label: "Active Vehicles", value: 53 },
    { label: "Available Vehicles", value: 42 },
    { label: "Vehicles in Maintenance", value: 5 },
    { label: "Active Trips", value: 18 },
    { label: "Pending Trips", value: 9 },
    { label: "Drivers on Duty", value: 26 },
    { label: "Fleet Utilization", value: 81, suffix: "%" },
];

export default function DashboardPage() {
    return (
        <DashboardShell
            headerTitle={<h1 className={design.pageTitle}>Dashboard</h1>}
            searchPlaceholder="Search…"
            // headerRight={
            //     <DashboardUserBadge
            //         name="Raven K."
            //         role="Dispatcher"
            //         initials="RK"
            //     />
            // }
        >
            <div className="flex min-w-0 flex-col gap-6 py-6">
                <div className="flex min-w-0 flex-col gap-6 px-4 sm:px-6">
                    <DashboardFilters />

                    <HorizontalScrollRow className="flex min-w-0 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="min-w-50 flex-1">
                                <KPICard
                                    label={stat.label}
                                    value={stat.value}
                                    suffix={stat.suffix}
                                />
                            </div>
                        ))}
                    </HorizontalScrollRow>
                </div>

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
