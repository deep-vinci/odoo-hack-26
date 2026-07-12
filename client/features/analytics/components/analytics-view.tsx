import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { KPICard } from "@/components/ui/kpi-card";
import { design } from "@/lib/design";
import { MonthlyRevenueChart } from "@/features/analytics/components/monthly-revenue-chart";
import { TopCostliestVehiclesChart } from "@/features/analytics/components/top-costliest-vehicles-chart";
import { analyticsKpis } from "@/features/analytics/types";

export function AnalyticsView() {
    return (
        <div
            className={
                design.pageContainer +
                " flex min-w-0 flex-col gap-6 px-4 py-6 sm:px-6"
            }
        >
            <div className="flex flex-col gap-2">
                <HorizontalScrollRow className="flex min-w-0 gap-4">
                    {analyticsKpis.map((kpi) => (
                        <div key={kpi.label} className="min-w-55 flex-1">
                            <KPICard
                                label={kpi.label}
                                value={kpi.value}
                                prefix={kpi.prefix}
                                suffix={kpi.suffix}
                                maximumFractionDigits={kpi.maximumFractionDigits}
                            />
                        </div>
                    ))}
                </HorizontalScrollRow>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                <MonthlyRevenueChart />
                <TopCostliestVehiclesChart />
            </div>
        </div>
    );
}
