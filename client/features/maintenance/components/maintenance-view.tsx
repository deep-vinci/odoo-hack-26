"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
    MaintenanceRecordForm,
    type MaintenanceFormValues,
} from "@/features/maintenance/components/maintenance-record-form";
import { MaintenanceLogTable } from "@/features/maintenance/components/maintenance-log-table";
import {
    initialMaintenanceRecords,
    initialMaintenanceVehicles,
    type MaintenanceRecord,
} from "@/features/maintenance/types";

export function MaintenanceView() {
    const [records, setRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
    const recordSequenceRef = useRef(initialMaintenanceRecords.length + 1);
    const [addOpen, setAddOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

    function latestStatus(vehicleId: string, excludeId?: string) {
        for (const record of records) {
            if (record.id === excludeId) continue;
            if (record.vehicleId === vehicleId) return record.status;
        }
        return undefined;
    }

    function vehicleInShop(vehicleId: string, excludeId?: string) {
        return latestStatus(vehicleId, excludeId) === "in-shop";
    }

    function handleAddRecord(values: MaintenanceFormValues) {
        const id = `m${recordSequenceRef.current}`;
        recordSequenceRef.current += 1;
        setRecords((prev) => [{ id, ...values }, ...prev]);
        setAddOpen(false);
    }

    function handleUpdateRecord(id: string, values: MaintenanceFormValues) {
        setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...values } : record)));
        setEditingRecord(null);
    }

    return (
        <>
            <MaintenanceLogTable
                records={records}
                vehicles={initialMaintenanceVehicles}
                onAddRecord={() => setAddOpen(true)}
                onEditRecord={setEditingRecord}
            />

            <Modal
                open={addOpen}
                onOpenChange={setAddOpen}
                title="Log Service Record"
                description="Record vehicle maintenance and update its shop status."
            >
                <MaintenanceRecordForm
                    vehicles={initialMaintenanceVehicles}
                    vehicleInShop={(vehicleId) => vehicleInShop(vehicleId)}
                    onSubmit={handleAddRecord}
                    onCancel={() => setAddOpen(false)}
                />
            </Modal>

            <Modal
                open={editingRecord !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingRecord(null);
                }}
                title="Edit Service Record"
                description="Update the details of this maintenance record."
            >
                {editingRecord ? (
                    <MaintenanceRecordForm
                        record={editingRecord}
                        vehicles={initialMaintenanceVehicles}
                        vehicleInShop={(vehicleId) => vehicleInShop(vehicleId, editingRecord.id)}
                        submitLabel="Save Changes"
                        onSubmit={(values) => handleUpdateRecord(editingRecord.id, values)}
                        onCancel={() => setEditingRecord(null)}
                    />
                ) : null}
            </Modal>
        </>
    );
}
