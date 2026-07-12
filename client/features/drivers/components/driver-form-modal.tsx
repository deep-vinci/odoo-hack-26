"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { CreateDriverInput, Driver } from "@/features/drivers/api";
import {
    useCreateDriver,
    useUpdateDriver,
} from "@/features/drivers/use-drivers";

type FormState = {
    name: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    contact_number: string;
    safety_score: string;
};

const emptyForm: FormState = {
    name: "",
    license_number: "",
    license_category: "",
    license_expiry_date: "",
    contact_number: "",
    safety_score: "100",
};

const toFormState = (driver: Driver): FormState => ({
    name: driver.name,
    license_number: driver.license_number,
    license_category: driver.license_category,
    license_expiry_date: driver.license_expiry_date,
    contact_number: driver.contact_number,
    safety_score: String(driver.safety_score),
});

const FORM_ID = "driver-form";

type DriverFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    driver?: Driver | null;
};

export function DriverFormModal({
    open,
    onOpenChange,
    driver,
}: DriverFormModalProps) {
    const isEdit = Boolean(driver);
    const [form, setForm] = useState<FormState>(
        driver ? toFormState(driver) : emptyForm,
    );
    const [editingId, setEditingId] = useState<string | null>(driver?.id ?? null);

    const createMutation = useCreateDriver();
    const updateMutation = useUpdateDriver();
    const loading = createMutation.isPending || updateMutation.isPending;

    const nextId = driver?.id ?? null;
    if (open && nextId !== editingId) {
        setEditingId(nextId);
        setForm(driver ? toFormState(driver) : emptyForm);
    }

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            if (isEdit && driver) {
                await updateMutation.mutateAsync({
                    id: driver.id,
                    input: {
                        name: form.name.trim(),
                        license_number: form.license_number.trim(),
                        license_category: form.license_category.trim(),
                        license_expiry_date: form.license_expiry_date,
                        contact_number: form.contact_number.trim(),
                    },
                });
                toast.success("Driver updated.");
            } else {
                const payload: CreateDriverInput = {
                    name: form.name.trim(),
                    license_number: form.license_number.trim(),
                    license_category: form.license_category.trim(),
                    license_expiry_date: form.license_expiry_date,
                    contact_number: form.contact_number.trim(),
                    safety_score:
                        form.safety_score === ""
                            ? undefined
                            : Number(form.safety_score),
                };
                await createMutation.mutateAsync(payload);
                toast.success("Driver added.");
            }
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to save driver. Please try again.",
            );
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit Driver" : "Add Driver"}
            description={
                isEdit
                    ? "Update the driver details below."
                    : "Register a new driver in the fleet."
            }
            footer={
                <>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#1f2430] transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form={FORM_ID}
                        disabled={loading}
                        className="inline-flex h-9 min-w-[110px] cursor-pointer items-center justify-center rounded-[4px] border border-[#2C5EAD] bg-[#2C5EAD] px-4 text-sm font-medium text-white transition hover:border-[#244f96] hover:bg-[#244f96] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : isEdit ? (
                            "Save changes"
                        ) : (
                            "Add driver"
                        )}
                    </button>
                </>
            }
        >
            <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" required>
                        Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Alex Fernandes"
                        value={form.name}
                        onChange={(event) => set("name", event.target.value)}
                        disabled={loading}
                        maxLength={100}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="license_number" required>
                            License number
                        </Label>
                        <Input
                            id="license_number"
                            name="license_number"
                            placeholder="DL-88213"
                            value={form.license_number}
                            onChange={(event) =>
                                set("license_number", event.target.value)
                            }
                            disabled={loading}
                            maxLength={50}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="license_category" required>
                            License category
                        </Label>
                        <Input
                            id="license_category"
                            name="license_category"
                            placeholder="LMV / HMV"
                            value={form.license_category}
                            onChange={(event) =>
                                set("license_category", event.target.value)
                            }
                            disabled={loading}
                            maxLength={20}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="license_expiry_date" required>
                            License expiry
                        </Label>
                        <Input
                            id="license_expiry_date"
                            name="license_expiry_date"
                            type="date"
                            value={form.license_expiry_date}
                            onChange={(event) =>
                                set("license_expiry_date", event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact_number" required>
                            Contact number
                        </Label>
                        <Input
                            id="contact_number"
                            name="contact_number"
                            placeholder="9876543210"
                            value={form.contact_number}
                            onChange={(event) =>
                                set("contact_number", event.target.value)
                            }
                            disabled={loading}
                            maxLength={20}
                            required
                        />
                    </div>
                </div>

                {!isEdit ? (
                    <div className="space-y-2">
                        <Label htmlFor="safety_score">Safety score</Label>
                        <Input
                            id="safety_score"
                            name="safety_score"
                            type="number"
                            min={0}
                            max={100}
                            step="1"
                            placeholder="100"
                            value={form.safety_score}
                            onChange={(event) =>
                                set("safety_score", event.target.value)
                            }
                            disabled={loading}
                        />
                    </div>
                ) : null}
            </form>
        </Modal>
    );
}
