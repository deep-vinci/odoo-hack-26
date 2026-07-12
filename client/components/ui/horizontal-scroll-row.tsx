"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HorizontalScrollRow({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY === 0 || el.scrollWidth <= el.clientWidth) return;
            el.scrollLeft += e.deltaY;
            e.preventDefault();
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <div ref={ref} className={cn("scrollbar-hide overflow-x-auto", className)}>
            {children}
        </div>
    );
}
