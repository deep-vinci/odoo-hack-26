import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { SettingsView } from "@/features/settings/components/settings-view";
import { design } from "@/lib/design";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <DashboardShell headerTitle={<h1 className={design.pageTitle}>Settings</h1>}>
      <SettingsView />
    </DashboardShell>
  );
}
