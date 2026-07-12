import { design } from "@/lib/design";

type StatusRow = {
    label: string;
    value: number;
    colorClassName: string;
};

const rows: StatusRow[] = [
    { label: "Available", value: 79, colorClassName: "bg-emerald-500" },
    { label: "On Trip", value: 34, colorClassName: "bg-blue-500" },
    { label: "In Shop", value: 9, colorClassName: "bg-amber-500" },
    { label: "Retired", value: 3, colorClassName: "bg-red-400" },
];

const maxValue = Math.max(...rows.map((row) => row.value));

export function VehicleStatusPanel() {
    return (
        <div className={design.panel + " p-5"}>
            <h2 className={design.sectionTitle}>Vehicle Status</h2>
            <div className="mt-5 flex flex-col gap-3.5">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-sm text-gray-600">
                            {row.label}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${row.colorClassName}`}
                                style={{ width: `${(row.value / maxValue) * 100}%` }}
                            />
                        </div>
                        <span className="w-8 shrink-0 text-right text-sm tabular-nums text-gray-500">
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
