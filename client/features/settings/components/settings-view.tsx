"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { design } from "@/lib/design";
import { GeneralSettingsPanel } from "@/features/settings/components/general-settings";
import { RbacSettingsPanel } from "@/features/settings/components/rbac-settings";
import type { SettingsTab } from "@/features/settings/types";

const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "rbac", label: "Role-Based Access" },
];

export function SettingsView() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");

    return (
        <div
            className={
                design.pageContainer + " flex min-w-0 flex-col gap-6 px-4 py-6 sm:px-6"
            }
        >
            <div className={design.tabList} role="tablist" aria-label="Settings sections">
                {tabs.map((tab) => {
                    const active = tab.key === activeTab;
                    return (
                        <Button
                            key={tab.key}
                            type="button"
                            variant="tab"
                            active={active}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </div>

            <div>
                {activeTab === "general" ? <GeneralSettingsPanel /> : <RbacSettingsPanel />}
            </div>
        </div>
    );
}
