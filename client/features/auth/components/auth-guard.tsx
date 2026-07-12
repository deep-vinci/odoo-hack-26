"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { getStoredToken } from "@/lib/auth-storage";

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

export function AuthGuard({ children }: { children: ReactNode }) {
    const router = useRouter();
    const token = useSyncExternalStore(
        subscribe,
        getStoredToken,
        () => null,
    );

    useEffect(() => {
        if (!token) {
            router.replace("/login");
        }
    }, [token, router]);

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return <>{children}</>;
}
