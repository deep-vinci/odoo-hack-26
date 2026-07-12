"use client";

import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    loading = false,
    onOpenChange,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            className="max-w-[420px]"
            footer={
                <>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#1f2430] transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            "inline-flex h-9 min-w-[96px] cursor-pointer items-center justify-center rounded-[4px] px-4 text-sm font-medium text-white transition disabled:pointer-events-none disabled:opacity-50",
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-[#1b181e] hover:bg-[#2a2630]",
                        )}
                    >
                        {loading ? (
                            <Spinner spinnerClassName="border-white/40 border-t-white" />
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </>
            }
        >
            <p className="text-sm text-gray-600">{description}</p>
        </Modal>
    );
}
