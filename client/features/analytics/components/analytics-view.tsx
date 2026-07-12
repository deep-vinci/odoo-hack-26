"use client";

import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import { KPICard } from "@/components/ui/kpi-card";
import { design } from "@/lib/design";
import { CostTrendChart } from "@/features/analytics/components/cost-trend-chart";
import { TopCostliestVehiclesChart } from "@/features/analytics/components/top-costliest-vehicles-chart";
import {
    useCostTrend,
    useFuelEfficiency,
    useOperationalCosts,
    useUtilizationTrend,
    useVehicleRoi,
} from "@/features/analytics/use-analytics";

export function AnalyticsView() {
    const operationalCosts = useOperationalCosts();
    const fuelEfficiency = useFuelEfficiency();
    const vehicleRoi = useVehicleRoi();
    const utilization = useUtilizationTrend();
    const costTrend = useCostTrend();

    const roiVehicles = vehicleRoi.data?.vehicles ?? [];
    const totalRevenue = roiVehicles.reduce((sum, v) => sum + v.total_revenue, 0);
    const totalNetReturn = roiVehicles.reduce((sum, v) => sum + v.net_return, 0);
    const totalAcquisition = roiVehicles.reduce(
        (sum, v) => sum + v.vehicle.acquisition_cost,
        0,
    );
    const fleetRoiPct =
        totalAcquisition > 0 ? (totalNetReturn / totalAcquisition) * 100 : 0;

    const utilizationSeries = utilization.data?.series ?? [];
    const latestUtilization =
        utilizationSeries.length > 0
            ? utilizationSeries[utilizationSeries.length - 1].utilization_pct
            : 0;

    const totals = operationalCosts.data?.totals;

    const kpis = [
        {
            label: "Fleet Efficiency",
            value: fuelEfficiency.data?.fleet_average_km_per_liter ?? 0,
            suffix: " km/l",
            maximumFractionDigits: 1,
            isLoading: fuelEfficiency.isLoading,
        },
        {
            label: "Fleet Utilization",
            value: latestUtilization,
            suffix: "%",
            maximumFractionDigits: 1,
            isLoading: utilization.isLoading,
        },
        {
            label: "Total Revenue",
            value: totalRevenue,
            prefix: "₹",
            isLoading: vehicleRoi.isLoading,
        },
        {
            label: "Operational Cost",
            value: totals?.operational_cost ?? 0,
            prefix: "₹",
            isLoading: operationalCosts.isLoading,
        },
        {
            label: "Fuel Cost",
            value: totals?.fuel_cost ?? 0,
            prefix: "₹",
            isLoading: operationalCosts.isLoading,
        },
        {
            label: "Maintenance Cost",
            value: totals?.maintenance_cost ?? 0,
            prefix: "₹",
            isLoading: operationalCosts.isLoading,
        },
        {
            label: "Net Return",
            value: totalNetReturn,
            prefix: "₹",
            isLoading: vehicleRoi.isLoading,
        },
        {
            label: "Fleet ROI",
            value: fleetRoiPct,
            suffix: "%",
            maximumFractionDigits: 1,
            isLoading: vehicleRoi.isLoading,
        },
    ];

    return (
        <div
            className={
                design.pageContainer +
                " flex min-w-0 flex-col gap-6 px-4 py-6 sm:px-6"
            }
        >
            <div className="flex flex-col gap-2">
                <HorizontalScrollRow className="flex min-w-0 gap-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="min-w-55 flex-1">
                            <KPICard
                                label={kpi.label}
                                value={kpi.value}
                                prefix={kpi.prefix}
                                suffix={kpi.suffix}
                                maximumFractionDigits={kpi.maximumFractionDigits}
                                isLoading={kpi.isLoading}
                            />
                        </div>
                    ))}
                </HorizontalScrollRow>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                <CostTrendChart series={costTrend.data?.series ?? []} />
                <TopCostliestVehiclesChart
                    vehicles={operationalCosts.data?.vehicles ?? []}
                />
            </div>
        </div>
    );
}
