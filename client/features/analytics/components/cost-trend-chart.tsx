"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { CostTrend } from "@/features/analytics/api";

const chartConfig = {
    fuel_cost: { label: "Fuel", color: "#2b7fd3" },
    maintenance_cost: { label: "Maintenance", color: "#e8871e" },
} satisfies ChartConfig;

const MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function monthLabel(month: string) {
    const parts = month.split("-");
    const index = Number(parts[1]) - 1;
    return MONTH_LABELS[index] ?? month;
}

function compactCurrency(value: number) {
    if (value >= 1000) {
        return `₹${(value / 1000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}k`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
}

type CostTrendChartProps = {
    series: CostTrend["series"];
};

export function CostTrendChart({ series }: CostTrendChartProps) {
    const data = series.map((point) => ({
        month: monthLabel(point.month),
        fuel_cost: point.fuel_cost,
        maintenance_cost: point.maintenance_cost,
    }));

    return (
        <div className={cn(design.panel, "flex min-w-0 flex-col gap-4 p-6")}>
            <div>
                <h2 className={design.sectionTitle}>Monthly Cost Trend</h2>
                <p className={design.sectionSubtitle}>
                    Fuel and maintenance spend per month across the fleet.
                </p>
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eef0f3" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        tickFormatter={compactCurrency}
                    />
                    <ChartTooltip
                        cursor={{ fill: "#f2f4f7" }}
                        content={
                            <ChartTooltipContent
                                formatter={(value) => (
                                    <span className="font-mono font-medium text-gray-900 tabular-nums">
                                        ₹{Number(value).toLocaleString("en-IN")}
                                    </span>
                                )}
                            />
                        }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="fuel_cost"
                        name="Fuel"
                        fill="var(--color-fuel_cost)"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="maintenance_cost"
                        name="Maintenance"
                        fill="var(--color-maintenance_cost)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
