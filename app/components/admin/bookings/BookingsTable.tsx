"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail } from "lucide-react";
import { sendBookingConfirmation } from "@/app/actions/email";
import { deleteBooking, updateBookingStatus } from "@/app/actions/bookings";
import InvoiceButton from "./InvoiceButton";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

type BookingRow = {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  guests: number;
  flightIncluded: boolean;
  customerName: string;
  customerEmail: string;
  customerId: string;
  destinationName: string;
  destinationId: string;
  destinationCountry: string;
};

export default function BookingsTable({
  bookings,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  bookings: BookingRow[];
  onEdit: (booking: BookingRow) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const handleSendEmail = async (bookingId: string) => {
    setEmailError(null);
    setSendingEmail(bookingId);
    const result = await sendBookingConfirmation(bookingId);
    setSendingEmail(null);

    if ("error" in result) {
      setEmailError(result.error ?? "Failed to send email.");
      return;
    }

    setEmailSent(bookingId);
    setTimeout(() => setEmailSent(null), 3000);
  };

  if (bookings.length === 0) {
    return <p className="py-12 text-center text-gray-400">No bookings found.</p>;
  }

  return (
    <>
      {emailError && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {emailError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
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
            {bookings.map((booking) => (
              <tr key={booking._id} className="transition hover:bg-gray-50">
                <td className="py-3">
                  <p className="font-medium text-gray-800">
                    {booking.customerName || "-"}
                  </p>
                  <p className="text-xs text-gray-400">{booking.customerEmail}</p>
                </td>
                <td className="py-3">
                  <p className="font-medium">{booking.destinationName || "-"}</p>
                  <p className="text-xs text-gray-400">
                    {booking.destinationCountry}
                  </p>
                </td>
                <td className="py-3 text-gray-600">
                  <p>
                    {booking.startDate
                      ? new Date(booking.startDate).toLocaleDateString("sl-SI")
                      : "-"}
                  </p>
                  <p className="text-xs text-gray-400">
                    To{" "}
                    {booking.endDate
                      ? new Date(booking.endDate).toLocaleDateString("sl-SI")
                      : "-"}
                  </p>
                </td>
                <td className="py-3 text-center">{booking.guests || 1}</td>
                <td className="py-3 text-center">
                  {booking.flightIncluded ? (
                    <span className="font-medium text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  EUR {booking.totalPrice?.toLocaleString() || "-"}
                </td>
                <td className="py-3">
                  <select
                    value={booking.status}
                    disabled={loadingId === booking._id}
                    onChange={(e) =>
                      handleStatusChange(booking._id, e.target.value)
                    }
                    className={`appearance-none cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary ${STATUS_COLORS[booking.status] || "bg-gray-100"}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(booking)}
                      className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <InvoiceButton booking={booking} />
                    <button
                      onClick={() => handleSendEmail(booking._id)}
                      disabled={sendingEmail === booking._id}
                      className={`rounded-lg p-1.5 transition ${emailSent === booking._id ? "bg-green-100 text-green-600" : "text-blue-400 hover:bg-blue-50"}`}
                      title="Send confirmation email"
                    >
                      <Mail size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(booking._id)}
                      className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Delete booking?</h3>
            <p className="mb-6 text-sm text-gray-500">
              This action cannot be undone.
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
    </>
  );
}
