"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
};

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
}: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150 data-closed:opacity-0 data-open:opacity-100" />
                <Dialog.Popup
                    className={cn(
                        "fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[8px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition-all duration-150 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100",
                        className,
                    )}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
                        <div className="min-w-0">
                            <Dialog.Title className="text-base font-semibold text-gray-900">
                                {title}
                            </Dialog.Title>
                            {description ? (
                                <Dialog.Description className="mt-1 text-sm text-gray-500">
                                    {description}
                                </Dialog.Description>
                            ) : null}
                        </div>
                        <Dialog.Close
                            aria-label="Close"
                            className="-mr-1.5 -mt-0.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20"
                        >
                            <XIcon size={18} weight="bold" />
                        </Dialog.Close>
                    </div>

                    <div className="min-w-0 px-6 py-5">{children}</div>

                    {footer ? (
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
                            {footer}
                        </div>
                    ) : null}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
