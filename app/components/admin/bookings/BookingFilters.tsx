// components/admin/bookings/BookingFilters.tsx
"use client";

import { ArrowUpDown } from "lucide-react";

export default function BookingFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
}: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: any) => void;
  sortDir: "asc" | "desc";
  setSortDir: (v: "asc" | "desc") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        placeholder="Search customer, destination..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
      >
        <option value="createdAt">Sort: Created</option>
        <option value="startDate">Sort: Start Date</option>
        <option value="totalPrice">Sort: Price</option>
      </select>
      <button
        onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
        className="px-3 py-2 rounded-xl border text-sm flex items-center gap-1 hover:bg-gray-50"
      >
        <ArrowUpDown size={14} />
        {sortDir === "desc" ? "Desc" : "Asc"}
      </button>
    </div>
  );
}
