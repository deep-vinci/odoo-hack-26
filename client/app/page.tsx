import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-100 via-white to-slate-200 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-600">
            Enter your email and password to continue.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#2C5EAD] focus:ring-4 focus:ring-[#2C5EAD]/10"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-[#2C5EAD] transition hover:text-[#244f96]"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#2C5EAD] focus:ring-4 focus:ring-[#2C5EAD]/10"
            />
          </div>

          <Button type="submit" fullWidth className="h-12 text-sm font-semibold">
            Log in
          </Button>
        </form>
      </section>
    </main>
  );
}
