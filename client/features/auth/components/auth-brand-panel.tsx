const routes = [
    {
        color: "#5B8DEF",
        d: "M-20 90 C 120 90, 150 210, 300 210 S 520 330, 640 330",
        stations: [
            { cx: 120, cy: 90 },
            { cx: 300, cy: 210 },
            { cx: 470, cy: 292 },
        ],
    },
    {
        color: "#34D399",
        d: "M-20 260 C 90 260, 140 150, 300 150 S 500 60, 640 60",
        stations: [
            { cx: 90, cy: 260 },
            { cx: 300, cy: 150 },
            { cx: 452, cy: 96 },
        ],
    },
    {
        color: "#FBBF24",
        d: "M60 520 C 60 400, 210 400, 210 300 S 380 150, 380 -20",
        stations: [
            { cx: 60, cy: 440 },
            { cx: 210, cy: 300 },
            { cx: 315, cy: 150 },
        ],
    },
];

const lines = [
    { color: "#5B8DEF", label: "01", name: "Downtown Loop" },
    { color: "#34D399", label: "02", name: "Harbor Express" },
    { color: "#FBBF24", label: "03", name: "North Corridor" },
];

function AuthBrandPanel() {
    return (
        <aside className="relative hidden overflow-hidden bg-[#0B1120] lg:flex lg:w-[46%] lg:max-w-[640px] lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(91,141,239,0.28),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(11,17,32,0.65))]" />

            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]"
                viewBox="0 0 600 500"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
            >
                <defs>
                    <pattern
                        id="brand-grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M40 0H0V40"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="1"
                        />
                    </pattern>
                </defs>
                <rect width="600" height="500" fill="url(#brand-grid)" />
                {routes.map((route) => (
                    <path
                        key={route.d}
                        d={route.d}
                        stroke={route.color}
                        strokeOpacity="0.9"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                ))}
                {routes.flatMap((route) =>
                    route.stations.map((station) => (
                        <g key={`${route.d}-${station.cx}-${station.cy}`}>
                            <circle
                                cx={station.cx}
                                cy={station.cy}
                                r="6.5"
                                fill="#0B1120"
                                stroke={route.color}
                                strokeWidth="2.5"
                            />
                            <circle
                                cx={station.cx}
                                cy={station.cy}
                                r="12"
                                fill={route.color}
                                fillOpacity="0.12"
                            />
                        </g>
                    )),
                )}
            </svg>

            <div className="relative flex items-center gap-3 p-12">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 ring-1 ring-white/15 backdrop-blur">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M4 18h16M6 6h12M8 6v12M16 6v12"
                            stroke="white"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                        />
                        <circle cx="8" cy="18" r="1.75" fill="white" />
                        <circle cx="16" cy="18" r="1.75" fill="white" />
                    </svg>
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">
                    TransitOps
                </span>
            </div>

            <div className="relative px-12 pb-14">
                <p className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">
                    Fleet control room
                </p>
                <h2 className="mt-4 max-w-[16ch] text-4xl leading-[1.1] font-semibold tracking-tight text-white">
                    Every route, vehicle and shift in one place.
                </h2>
                <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/60">
                    Dispatch, track and reconcile your entire network from a
                    single operations console built for the people who keep it
                    moving.
                </p>

                <div className="mt-10 flex flex-col gap-3">
                    {lines.map((line) => (
                        <div key={line.label} className="flex items-center gap-3">
                            <span
                                className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[11px] font-semibold text-[#0B1120]"
                                style={{ backgroundColor: line.color }}
                            >
                                {line.label}
                            </span>
                            <span className="h-px flex-1 max-w-[52px] bg-white/15" />
                            <span className="text-sm font-medium text-white/70">
                                {line.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

export { AuthBrandPanel };
