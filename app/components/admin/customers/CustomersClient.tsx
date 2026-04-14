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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c._id !== id));
    setConfirmDelete(null);
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Bookings</th>
              <th className="pb-3 font-medium">Total Spent</th>
              <th className="pb-3 font-medium">Joined</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 transition">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                    <span className="font-medium text-gray-800">{c.username || "—"}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">{c.email}</td>
                <td className="py-3 text-center">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {c.bookingsCount || 0}
                  </span>
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  €{c.totalSpent?.toLocaleString() || "0"}
                </td>
                <td className="py-3 text-gray-500">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString("sl-SI") : "—"}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => setConfirmDelete(c._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No customers found.</p>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete customer?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the customer account.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                disabled={loadingId === confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                {loadingId === confirmDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}