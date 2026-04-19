"use client";

import { useState } from "react";
import { Trash2, User } from "lucide-react";
import { deleteCustomer } from "@/app/actions/customers";

type Customer = {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  bookingsCount: number;
  totalSpent: number;
};

export default function CustomersClient({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "bookingsCount" | "totalSpent"
  >("createdAt");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = customers
    .filter(
      (customer) =>
        customer.username?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "bookingsCount") {
        return (b.bookingsCount || 0) - (a.bookingsCount || 0);
      }
      if (sortBy === "totalSpent") {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    setConfirmDelete(null);
    setLoadingId(null);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as "createdAt" | "bookingsCount" | "totalSpent",
            )
          }
          className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="createdAt">Sort: Newest</option>
          <option value="bookingsCount">Sort: Bookings</option>
          <option value="totalSpent">Sort: Total Spent</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Bookings</th>
              <th className="pb-3 font-medium">Total Spent</th>
              <th className="pb-3 font-medium">Joined</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((customer) => (
              <tr key={customer._id} className="transition hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User size={14} className="text-primary" />
                    </div>
                    <span className="font-medium text-gray-800">
                      {customer.username || "-"}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">{customer.email}</td>
                <td className="py-3 text-center">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                    {customer.bookingsCount || 0}
                  </span>
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  EUR {customer.totalSpent?.toLocaleString() || "0"}
                </td>
                <td className="py-3 text-gray-500">
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString("sl-SI")
                    : "-"}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => setConfirmDelete(customer._id)}
                    className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-gray-400">No customers found.</p>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Delete customer?</h3>
            <p className="mb-6 text-sm text-gray-500">
              This will permanently delete the customer account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loadingId === confirmDelete}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-60"
              >
                {loadingId === confirmDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
