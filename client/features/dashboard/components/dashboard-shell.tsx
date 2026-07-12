"use client";

import {
  Bus,
  ChartLine,
  GasPump,
  Gauge,
  Gear,
  MapTrifold,
  SignOut,
  Users,
  Wrench,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  DashboardLayout,
  type DashboardNavItem,
} from "@/components/ui/dashboard-layout";
import { prefetchRouteQueries } from "@/features/dashboard/route-prefetch";

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/fleet", label: "Fleet", icon: Bus },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/trips", label: "Trips", icon: MapTrifold },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/fuel-expenses", label: "Fuel & Expenses", icon: GasPump },
  { href: "/analytics", label: "Analytics", icon: ChartLine },
  { href: "/settings", label: "Settings", icon: Gear },
];

type DashboardShellProps = {
  headerTitle?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ headerTitle, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleNavHover = (href: string) => {
    router.prefetch(href);
    prefetchRouteQueries(queryClient, href);
  };

  return (
    <div className="h-screen">
      <DashboardLayout
        navItems={navItems}
        logoText="TransitOps"
        user={{ name: "TransitOps", role: "Operations" }}
        currentPath={pathname}
        onNavigate={(href) => router.push(href)}
        onNavHover={handleNavHover}
        headerTitle={headerTitle}
        footer={
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="group mx-2 my-0.5 flex h-9 w-[calc(100%-16px)] cursor-pointer items-center gap-3 rounded-[4px] px-3 text-sm font-medium text-[#cccccc] transition-all duration-200 hover:bg-[#ffffff1a]"
          >
            <SignOut size={18} />
            <span>Log out</span>
          </button>
        }
      >
        {children}
      </DashboardLayout>
    </div>
  );
}
