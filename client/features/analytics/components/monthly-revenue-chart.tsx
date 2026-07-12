"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import { monthlyRevenue } from "@/features/analytics/types";

const chartConfig = {
    revenue: { label: "Revenue", color: "#2b7fd3" },
} satisfies ChartConfig;

function compactCurrency(value: number) {
    if (value >= 1000) {
        return `₹${(value / 1000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}k`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
}

export function MonthlyRevenueChart() {
    return (
        <div className={cn(design.panel, "flex min-w-0 flex-col gap-4 p-6")}>
            <div>
                <h2 className={design.sectionTitle}>Monthly Revenue</h2>
                <p className={design.sectionSubtitle}>Revenue booked per month across the fleet.</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart accessibilityLayer data={monthlyRevenue} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
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
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
