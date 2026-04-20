"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Compass,
  LayoutDashboard,
  LogOut,
  MapPin,
  User,
} from "lucide-react";

const links = [
  { href: "/user", label: "Overview", icon: LayoutDashboard },
  { href: "/user/destinations", label: "Destinations", icon: Compass },
  { href: "/user/bookings", label: "My bookings", icon: CalendarCheck },
  { href: "/user/profile", label: "Profile", icon: User },
];

export default function UserShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const path = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-x-0 top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:inset-y-0 lg:left-0 lg:right-auto lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/user" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
              <MapPin size={20} />
            </span>
            <span>
              <span className="block text-base font-bold">Travel Planner</span>
              <span className="block text-xs text-slate-500">
                {userName || "My account"}
              </span>
            </span>
          </Link>

          <Link
            href="/api/auth/signout"
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600 lg:hidden"
            title="Sign out"
          >
            <LogOut size={18} />
          </Link>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition lg:w-full ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/api/auth/signout"
          className="mt-8 hidden items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 lg:flex"
        >
          <LogOut size={18} />
          Sign out
        </Link>
      </aside>

      <main className="px-4 pb-10 pt-32 sm:px-6 lg:ml-72 lg:px-10 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
