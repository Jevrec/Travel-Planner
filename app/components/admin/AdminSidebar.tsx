// components/admin/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Users,
  Mail,
  Upload,
  FileText,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/import", label: "Import", icon: Upload },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col py-6 px-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-primary">TravelAdmin</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition
              ${path === href ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/api/auth/signout"
        className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl"
      >
        <LogOut size={18} /> Sign out
      </Link>
    </aside>
  );
}
