"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail } from "lucide-react";
import { deleteBooking, updateBookingStatus } from "@/app/actions/bookings";
import InvoiceButton from "./InvoiceButton";
import { sendBookingConfirmation } from "@/app/actions/email";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export default function BookingsTable({
  bookings, onEdit, onDelete, onStatusChange,
}: {
  bookings: any[];
  onEdit: (b: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setLoadingId(id);
    await updateBookingStatus(id, status);
    onStatusChange(id, status);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteBooking(id);
    onDelete(id);
    setConfirmDelete(null);
    setLoadingId(null);
  };

  const handleSendEmail = async (booking: any) => {
    setSendingEmail(booking._id);
    const result = await sendBookingConfirmation(booking);
    setSendingEmail(null);
    if (!result.error) {
      setEmailSent(booking._id);
      setTimeout(() => setEmailSent(null), 3000);
    }
  };

  if (bookings.length === 0) {
    return <p className="text-center text-gray-400 py-12">No bookings found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Destination</th>
              <th className="pb-3 font-medium">Dates</th>
              <th className="pb-3 font-medium">Guests</th>
              <th className="pb-3 font-medium">Flight</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50 transition">
                <td className="py-3">
                  <p className="font-medium text-gray-800">{b.customerName || "—"}</p>
                  <p className="text-xs text-gray-400">{b.customerEmail}</p>
                </td>
                <td className="py-3">
                  <p className="font-medium">{b.destinationName || "—"}</p>
                  <p className="text-xs text-gray-400">{b.destinationCountry}</p>
                </td>
                <td className="py-3 text-gray-600">
                  <p>{b.startDate ? new Date(b.startDate).toLocaleDateString("sl-SI") : "—"}</p>
                  <p className="text-xs text-gray-400">
                    → {b.endDate ? new Date(b.endDate).toLocaleDateString("sl-SI") : "—"}
                  </p>
                </td>
                <td className="py-3 text-center">{b.guests || 1}</td>
                <td className="py-3 text-center">
                  {b.flightIncluded
                    ? <span className="text-green-600 font-medium">✓</span>
                    : <span className="text-gray-300">✗</span>}
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  €{b.totalPrice?.toLocaleString() || "—"}
                </td>
                <td className="py-3">
                  <select
                    value={b.status}
                    disabled={loadingId === b._id}
                    onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-primary appearance-none
                      ${STATUS_COLORS[b.status] || "bg-gray-100"}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <InvoiceButton booking={b} />
                    <button
                      onClick={() => handleSendEmail(b)}
                      disabled={sendingEmail === b._id}
                      className={`p-1.5 rounded-lg transition
                        ${emailSent === b._id
                          ? "bg-green-100 text-green-600"
                          : "hover:bg-blue-50 text-blue-400"}`}
                      title="Send confirmation email"
                    >
                      <Mail size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(b._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete booking?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
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
    </>
  );
}