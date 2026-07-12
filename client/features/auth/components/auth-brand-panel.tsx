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

function AuthBrandPanel() {
    return (
        <aside className="relative hidden overflow-hidden bg-[#0B1120] lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
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

            <div className="relative flex items-center p-12">
                <span className="text-lg font-semibold tracking-tight text-white">
                    TransitOps
                </span>
            </div>

            <div className="relative px-12 pb-14">
                <h2 className="max-w-[16ch] text-4xl leading-[1.1] font-semibold tracking-tight text-white">
                    Every route, vehicle and shift in one place.
                </h2>
                <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/60">
                    Dispatch, track and reconcile your entire network from a
                    single operations console built for the people who keep it
                    moving.
                </p>
            </div>
        </aside>
    );
}

export { AuthBrandPanel };
