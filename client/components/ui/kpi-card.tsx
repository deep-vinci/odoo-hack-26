"use client";

import { TickerNumber } from "@/components/ui/ticker-number";

export function KPICardSkeleton() {
  return (
    <div className="h-28 rounded-[4px] bg-white p-5 flex flex-col shadow-[0_2px_6px_#1a181e0a]">
      <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
      <div className="mt-auto h-7 w-16 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}

type KPICardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
  maximumFractionDigits?: number;
};

export function KPICard({
  label,
  value,
  prefix = "",
  suffix = "",
  isLoading = false,
  maximumFractionDigits = 0,
}: KPICardProps) {
  return (
    <div className="h-28 rounded-[4px] bg-white p-5 flex flex-col shadow-[0_2px_6px_#1a181e0a]">
      {isLoading ? (
        <span className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
      ) : (
        <span className="block truncate text-sm font-medium text-gray-500">
          {label}
        </span>
      )}
      <p className="mt-auto text-[28px] font-semibold leading-none text-[#1f2430] tabular-nums">
        {isLoading ? (
          <span className="inline-block h-7 w-16 rounded bg-gray-100 animate-pulse" />
        ) : (
          <TickerNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            maximumFractionDigits={maximumFractionDigits}
          />
        )}
      </p>
    </div>
  );
}
