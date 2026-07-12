"use client";

import { TickerNumber } from "@/components/ui/ticker-number";

function InfoIcon({ tooltip }: { tooltip?: string }) {
  return (
    <span className="group relative ml-1 inline-flex shrink-0">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="text-gray-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 8v.01M12 11v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {tooltip ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 min-w-55 max-w-70 rounded px-3 py-2 text-xs leading-snug bg-white text-black shadow-md opacity-0 transition-opacity group-hover:opacity-100"
        >
          {tooltip}
        </span>
      ) : null}
    </span>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-[4px] bg-white p-5 flex flex-col shadow-[0_2px_6px_#1a181e0a]">
      <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
      <div className="mt-5 h-7 w-16 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}

type KPICardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
  tooltip?: string;
};

export function KPICard({
  label,
  value,
  prefix = "",
  suffix = "",
  isLoading = false,
  tooltip,
}: KPICardProps) {
  return (
    <div className="rounded-[4px] bg-white p-5 flex flex-col shadow-[0_2px_6px_#1a181e0a]">
      <div className="flex items-start flex-1">
        {isLoading ? (
          <span className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        ) : (
          <>
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <InfoIcon tooltip={tooltip} />
          </>
        )}
      </div>
      <div className="mt-5">
        <p className="text-[28px] font-semibold leading-none text-[#1f2430] tabular-nums">
          {isLoading ? (
            <span className="inline-block h-7 w-16 rounded bg-gray-100 animate-pulse" />
          ) : (
            <TickerNumber value={value} prefix={prefix} suffix={suffix} />
          )}
        </p>
      </div>
    </div>
  );
}
