import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">{children}</div>
    </AuthGuard>
  );
}
