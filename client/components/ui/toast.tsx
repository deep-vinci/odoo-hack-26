"use client";

import { useEffect, useReducer, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

type ToastItem = {
    id: string;
    message: ReactNode;
    variant: ToastVariant;
    duration: number;
    removing: boolean;
};

type ToastOptions = {
    duration?: number;
};

let _items: ToastItem[] = [];
let _counter = 0;
const _listeners = new Set<() => void>();

function _notify() {
    _listeners.forEach((fn) => fn());
}

function _add(message: ReactNode, variant: ToastVariant, options?: ToastOptions): string {
    const id = String(++_counter);
    const duration = options?.duration ?? 2000;
    _items = [..._items, { id, message, variant, duration, removing: false }];
    _notify();
    setTimeout(() => _remove(id), duration);
    return id;
}

function _remove(id: string) {
    _items = _items.map((t) => (t.id === id ? { ...t, removing: true } : t));
    _notify();
    setTimeout(() => {
        _items = _items.filter((t) => t.id !== id);
        _notify();
    }, 220);
}

export const toast = {
    show: (message: ReactNode, options?: ToastOptions) => _add(message, "default", options),
    success: (message: ReactNode, options?: ToastOptions) => _add(message, "success", options),
    error: (message: ReactNode, options?: ToastOptions) => _add(message, "error", options),
    dismiss: (id: string) => _remove(id),
};

const ICON_CSS = `
@keyframes _rht-circle{from{transform:scale(0) rotate(45deg);opacity:0}to{transform:scale(1) rotate(45deg);opacity:1}}
@keyframes _rht-checkmark{0%{height:0;width:0;opacity:0}40%{height:0;width:6px;opacity:1}100%{height:10px;width:6px;opacity:1}}
@keyframes _rht-line1{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes _rht-line2{from{transform:scale(0) rotate(90deg);opacity:0}to{transform:scale(1) rotate(90deg);opacity:1}}
`;

function SuccessIcon() {
    return (
        <div
            aria-hidden="true"
            style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                background: "#61d345",
                flexShrink: 0,
                position: "relative",
                margin: "0 6px",
                animation: "_rht-circle 0.3s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    borderRight: "2px solid #fff",
                    borderBottom: "2px solid #fff",
                    bottom: 6,
                    left: 6,
                    animation: "_rht-checkmark 0.2s ease-out 0.2s both",
                }}
            />
        </div>
    );
}

function ErrorIcon() {
    return (
        <div
            aria-hidden="true"
            style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                background: "#ff4b4b",
                flexShrink: 0,
                position: "relative",
                margin: "0 6px",
                animation: "_rht-circle 0.3s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    borderRadius: 3,
                    background: "#fff",
                    width: 12,
                    height: 2,
                    bottom: 9,
                    left: 4,
                    animation: "_rht-line1 0.15s ease-out 0.15s both",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    borderRadius: 3,
                    background: "#fff",
                    width: 12,
                    height: 2,
                    bottom: 9,
                    left: 4,
                    animation: "_rht-line2 0.15s ease-out 0.18s both",
                }}
            />
        </div>
    );
}

function ToastEntry({ item }: { item: ToastItem }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf2);
        });
        return () => cancelAnimationFrame(raf1);
    }, []);

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                transform:
                    visible && !item.removing
                        ? "translateY(0) scale(1)"
                        : "translateY(-10px) scale(0.96)",
                opacity: visible && !item.removing ? 1 : 0,
                transition: item.removing
                    ? "opacity 180ms ease-in, transform 180ms ease-in"
                    : "opacity 220ms ease-out, transform 220ms ease-out",
            }}
            className={cn(
                "pointer-events-auto flex items-center gap-2.5",
                "rounded-[4px] border border-[#e5e7eb] bg-white",
                "px-[15px] py-[12px] text-[14px] text-[#1f2430]",
                "shadow-[0_14px_32px_rgba(15,23,42,0.10)]",
            )}
        >
            {item.variant === "success" && <SuccessIcon />}
            {item.variant === "error" && <ErrorIcon />}
            <span>{item.message}</span>
        </div>
    );
}

function useToastStore(): ToastItem[] {
    const [, rerender] = useReducer((n: number) => n + 1, 0);

    useEffect(() => {
        _listeners.add(rerender);
        return () => {
            _listeners.delete(rerender);
        };
    }, []);

    return _items;
}

export function Toaster() {
    const items = useToastStore();

    return (
        <>
            <style>{ICON_CSS}</style>
            <div
                aria-label="Notifications"
                className="pointer-events-none fixed left-1/2 top-5 z-[9999] flex -translate-x-1/2 flex-col items-center gap-3"
            >
                {items.map((item) => (
                    <ToastEntry key={item.id} item={item} />
                ))}
            </div>
        </>
    );
}
