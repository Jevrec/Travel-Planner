// components/admin/BookingsTable.tsx
"use client";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

type DashboardBooking = {
  _id: string;
  customerName?: string;
  destinationName?: string;
  status?: string;
  totalPrice?: number;
  createdAt: string;
};

export default function BookingsTable({
  bookings,
}: {
  bookings: DashboardBooking[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalPrice">("createdAt");

  const filtered = bookings
    .filter((b) => {
      const matchSearch =
        b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        b.destinationName?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) =>
      sortBy === "totalPrice"
        ? (b.totalPrice || 0) - (a.totalPrice || 0)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div>
      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search customer or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "createdAt" | "totalPrice")
          }
          className="px-3 py-2 rounded-xl border text-sm"
        >
          <option value="createdAt">Sort by Date</option>
          <option value="totalPrice">Sort by Price</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Destination</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="py-3 font-medium">{b.customerName || "—"}</td>
                <td className="py-3 text-gray-600">
                  {b.destinationName || "—"}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${b.status ? STATUS_COLORS[b.status] || "" : ""}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-3 font-medium">
                  €{b.totalPrice?.toLocaleString() || "—"}
                </td>
                <td className="py-3 text-gray-500">
                  {new Date(b.createdAt).toLocaleDateString("sl-SI")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No bookings found.</p>
        )}
      </div>
    </div>
  );
}
