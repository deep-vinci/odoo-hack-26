import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen bg-white">
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </div>
    </main>
  );
}
