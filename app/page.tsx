import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.isAdmin) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(135deg,_#0c1424_0%,_#111827_45%,_#292524_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200/80">
              Travel Planner
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Organize bookings, customers, and school trips from one place.
            </h1>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/90 transition hover:border-white/35 hover:bg-white/8"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-sky-400 px-5 py-2 text-sm font-medium text-stone-950 transition hover:bg-sky-300"
            >
              Register
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-8">
            <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              A clean hub for managing destinations, reservations, customer
              records, imports, and email confirmations without switching
              between tools.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-stone-950 transition hover:bg-sky-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/8"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-sky-200">Bookings</p>
                <p className="mt-2 text-3xl font-semibold">24/7</p>
                <p className="mt-2 text-sm text-white/65">
                  Reservation overview with status updates and confirmation
                  emails.
                </p>
              </div>
              <div className="rounded-2xl bg-amber-300/12 p-4">
                <p className="text-sm text-amber-200">Destinations</p>
                <p className="mt-2 text-3xl font-semibold">Smart</p>
                <p className="mt-2 text-sm text-white/65">
                  Track trips, pricing, and capacity from one admin panel.
                </p>
              </div>
              <div className="rounded-2xl bg-white/6 p-4 sm:col-span-2">
                <p className="text-sm text-white/65">Built for daily work</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Faster access for admins, simpler entry for everyone else.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:hidden">
          <Link href="/login" className="rounded-xl bg-white px-4 py-3 text-center text-stone-950">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-white/15 px-4 py-3 text-center text-white"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
