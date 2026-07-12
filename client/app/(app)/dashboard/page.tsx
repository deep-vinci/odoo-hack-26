import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { design } from "@/lib/design";

export const metadata: Metadata = {
    title: "Dashboard",
};

const stats = [
    { label: "Active vehicles", value: "128", hint: "+4 vs. yesterday" },
    { label: "On-time rate", value: "94.2%", hint: "Last 24h" },
    { label: "Open tickets", value: "17", hint: "3 high priority" },
    { label: "Daily riders", value: "42.6k", hint: "+2.1% this week" },
];

export default function DashboardPage() {
    return (
        <DashboardShell
            headerTitle={<h1 className={design.pageTitle}>Dashboard</h1>}
        >
            <div className={design.pageContainer + " px-4 py-6 sm:px-6"}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={design.card + " p-5"}>
                            <p className="text-sm text-gray-500">
                                {stat.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                {stat.hint}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
