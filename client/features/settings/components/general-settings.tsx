"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";
import {
    currencyOptions,
    distanceUnitOptions,
    initialGeneralSettings,
    type GeneralSettings,
} from "@/features/settings/types";

export function GeneralSettingsPanel() {
    const [settings, setSettings] = useState<GeneralSettings>(initialGeneralSettings);
    const [saved, setSaved] = useState<GeneralSettings>(initialGeneralSettings);
    const [justSaved, setJustSaved] = useState(false);

    const dirty =
        settings.depotName !== saved.depotName ||
        settings.currency !== saved.currency ||
        settings.distanceUnit !== saved.distanceUnit;

    function update<Key extends keyof GeneralSettings>(key: Key, value: GeneralSettings[Key]) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setJustSaved(false);
    }

    function handleSave() {
        setSaved(settings);
        setJustSaved(true);
    }

    return (
        <div className={cn(design.card, "max-w-lg p-6")}>
            <div>
                <h2 className={design.sectionTitle}>General</h2>
                <p className={design.sectionSubtitle}>
                    Depot-wide defaults applied across trips, fuel and analytics.
                </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="depot-name">Depot Name</Label>
                    <Input
                        id="depot-name"
                        value={settings.depotName}
                        onChange={(event) => update("depotName", event.target.value)}
                        placeholder="e.g. Gandhinagar Depot GJ4"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                        id="currency"
                        value={settings.currency}
                        onChange={(event) => update("currency", event.target.value)}
                        className={cn(design.select, design.selectFull)}
                    >
                        {currencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="distance-unit">Distance Unit</Label>
                    <select
                        id="distance-unit"
                        value={settings.distanceUnit}
                        onChange={(event) => update("distanceUnit", event.target.value)}
                        className={cn(design.select, design.selectFull)}
                    >
                        {distanceUnitOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
                <Button type="button" onClick={handleSave} disabled={!dirty}>
                    Save changes
                </Button>
                {justSaved && !dirty ? (
                    <span className="text-sm font-medium text-emerald-600">Settings saved</span>
                ) : null}
            </div>
        </div>
    );
}
