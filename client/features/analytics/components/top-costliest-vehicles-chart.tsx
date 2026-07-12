"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import { costliestVehicles, type CostliestVehiclePoint } from "@/features/analytics/types";

const tierColor: Record<CostliestVehiclePoint["tier"], string> = {
    high: "#f26d6d",
    medium: "#e8871e",
    low: "#2b7fd3",
};

const chartConfig = {
    cost: { label: "Cost" },
} satisfies ChartConfig;

export function TopCostliestVehiclesChart() {
    return (
        <div className={cn(design.panel, "flex min-w-0 flex-col gap-4 p-6")}>
            <div>
                <h2 className={design.sectionTitle}>Top Costliest Vehicles</h2>
                <p className={design.sectionSubtitle}>Total maintenance and fuel spend per vehicle.</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart
                    accessibilityLayer
                    layout="vertical"
                    data={costliestVehicles}
                    margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="vehicle"
                        tickLine={false}
                        axisLine={false}
                        width={78}
                    />
                    <ChartTooltip
                        cursor={{ fill: "#f2f4f7" }}
                        content={
                            <ChartTooltipContent
                                hideLabel
                                formatter={(value, _name, item) => (
                                    <div className="flex w-full items-center justify-between gap-4">
                                        <span className="text-gray-500">{item.payload.vehicle}</span>
                                        <span className="font-mono font-medium text-gray-900 tabular-nums">
                                            ₹{Number(value).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                )}
                            />
                        }
                    />
                    <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={18}>
                        {costliestVehicles.map((entry) => (
                            <Cell key={entry.vehicle} fill={tierColor[entry.tier]} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    );
}
