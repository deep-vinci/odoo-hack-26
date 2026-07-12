export type AnalyticsKpi = {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    maximumFractionDigits?: number;
};

export type MonthlyRevenuePoint = {
    month: string;
    revenue: number;
};

export type CostliestVehiclePoint = {
    vehicle: string;
    cost: number;
    tier: "high" | "medium" | "low";
};

export const analyticsKpis: AnalyticsKpi[] = [
    { label: "Fuel Efficiency", value: 8.4, suffix: " km/l", maximumFractionDigits: 1 },
    { label: "Fleet Utilization", value: 81, suffix: "%" },
    { label: "Operational Cost", value: 34070, prefix: "₹" },
    { label: "Vehicle ROI", value: 14.2, suffix: "%", maximumFractionDigits: 1 },
    { label: "Total Trips", value: 128 },
    { label: "On-Time Rate", value: 92, suffix: "%" },
    { label: "Active Vehicles", value: 47 },
    { label: "Avg Cost / km", value: 12.4, prefix: "₹", maximumFractionDigits: 1 },
];

export const roiFormula = "ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost";

export const monthlyRevenue: MonthlyRevenuePoint[] = [
    { month: "Jan", revenue: 182000 },
    { month: "Feb", revenue: 214000 },
    { month: "Mar", revenue: 198000 },
    { month: "Apr", revenue: 256000 },
    { month: "May", revenue: 231000 },
    { month: "Jun", revenue: 288000 },
    { month: "Jul", revenue: 274000 },
];

export const costliestVehicles: CostliestVehiclePoint[] = [
    { vehicle: "TRUCK-11", cost: 42600, tier: "high" },
    { vehicle: "MINI-03", cost: 18400, tier: "medium" },
    { vehicle: "VAN-05", cost: 7200, tier: "low" },
];
