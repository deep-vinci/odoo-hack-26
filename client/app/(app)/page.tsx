import Link from "next/link";
import { design } from "@/lib/design";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Home</h1>
      <p className="text-sm text-gray-600">
        You&apos;re in the authenticated area. Replace this with your dashboard.
      </p>
      <Link href="/login" className={design.link}>
        Go to login
      </Link>
    </main>
  );
}
