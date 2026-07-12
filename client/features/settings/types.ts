export type AccessLevel = "manage" | "view" | "none";

export type RbacModule = {
    key: string;
    label: string;
};

export type RbacRole = {
    key: string;
    label: string;
    access: Record<string, AccessLevel>;
};

export const rbacModules: RbacModule[] = [
    { key: "fleet", label: "Fleet" },
    { key: "drivers", label: "Drivers" },
    { key: "trips", label: "Trips" },
    { key: "fuel", label: "Fuel/Exp." },
    { key: "analytics", label: "Analytics" },
];

export const initialRbacRoles: RbacRole[] = [
    {
        key: "fleet-manager",
        label: "Fleet Manager",
        access: {
            fleet: "manage",
            drivers: "manage",
            trips: "none",
            fuel: "none",
            analytics: "manage",
        },
    },
    {
        key: "dispatcher",
        label: "Dispatcher",
        access: {
            fleet: "view",
            drivers: "none",
            trips: "manage",
            fuel: "none",
            analytics: "none",
        },
    },
    {
        key: "safety-officer",
        label: "Safety Officer",
        access: {
            fleet: "none",
            drivers: "manage",
            trips: "view",
            fuel: "none",
            analytics: "none",
        },
    },
    {
        key: "financial-analyst",
        label: "Financial Analyst",
        access: {
            fleet: "view",
            drivers: "none",
            trips: "none",
            fuel: "manage",
            analytics: "manage",
        },
    },
];

export const accessCycle: Record<AccessLevel, AccessLevel> = {
    none: "view",
    view: "manage",
    manage: "none",
};

export const accessLabel: Record<AccessLevel, string> = {
    manage: "Manage",
    view: "View",
    none: "No access",
};
