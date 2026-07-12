type DashboardUserBadgeProps = {
    name: string;
    role: string;
    initials: string;
};

export function DashboardUserBadge({ name, role, initials }: DashboardUserBadgeProps) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                {name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2C5EAD] py-0.5 pr-0.5 pl-2.5 text-xs font-medium text-white">
                {role}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold">
                    {initials}
                </span>
            </span>
        </div>
    );
}
