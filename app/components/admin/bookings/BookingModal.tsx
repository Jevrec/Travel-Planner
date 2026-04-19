// components/admin/bookings/BookingModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createBooking, updateBooking } from "@/app/actions/bookings";

type Customer = { _id: string; username: string; email: string };
type Destination = {
  _id: string;
  name: string;
  country: string;
  pricePerNight: number;
};

type Booking = {
  _id: string;
  customerName: string;
  customerEmail: string;
  destinationId: string;
  destinationName: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  guests: number;
  flightIncluded: boolean;
  customerId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
};

type SaveResult = { error: string } | { success: boolean };

export default function BookingModal({
  booking,
  customers,
  destinations,
  onClose,
  onSaved,
}: {
  booking: Booking | null;
  customers: Customer[];
  destinations: Destination[];
  onClose: () => void;
  onSaved: (booking: Booking) => void;
}) {
  const isEdit = !!booking;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDest, setSelectedDest] = useState(booking?.destinationId || "");
  const [startDate, setStartDate] = useState(
    booking?.startDate ? booking.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    booking?.endDate ? booking.endDate.slice(0, 10) : "",
  );
  const [guests, setGuests] = useState(booking?.guests || 1);

  const selectedDestination = destinations.find((d) => d._id === selectedDest);
  const autoPrice =
    selectedDestination && startDate && endDate
      ? Math.round(
          selectedDestination.pricePerNight *
            Math.max(
              1,
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                86400000,
            ) *
            guests,
        )
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (autoPrice && !formData.get("totalPrice")) {
      formData.set("totalPrice", autoPrice.toString());
    }

    const result: SaveResult = isEdit
      ? await updateBooking(booking._id, formData)
      : await createBooking(formData);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const customer = customers.find((c) => c._id === formData.get("customerId"));

    onSaved({
      ...booking,
      _id: booking?._id || "temp-new-booking",
      status: String(formData.get("status") || "pending"),
      totalPrice:
        parseFloat(formData.get("totalPrice") as string) || autoPrice || 0,
      startDate: String(formData.get("startDate") || ""),
      endDate: String(formData.get("endDate") || ""),
      guests: parseInt(formData.get("guests") as string),
      flightIncluded: formData.get("flightIncluded") === "true",
      customerName: customer?.username || "",
      customerEmail: customer?.email || "",
      customerId: customer?._id || "",
      destinationName: selectedDestination?.name || "",
      destinationId: selectedDestination?._id || "",
      destinationCountry: selectedDestination?.country || "",
      createdAt: booking?.createdAt || new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Booking" : "New Booking"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Customer
            </label>
            <select
              name="customerId"
              required
              defaultValue={booking?.customerId || ""}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select customer...</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.username} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Destination
            </label>
            <select
              name="destinationId"
              required
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select destination...</option>
              {destinations.map((destination) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}, {destination.country}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Guests
              </label>
              <input
                type="number"
                name="guests"
                min={1}
                required
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Flight Included
              </label>
              <select
                name="flightIncluded"
                defaultValue={booking?.flightIncluded ? "true" : "false"}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Total Price (EUR)
              {autoPrice && (
                <span className="ml-2 font-medium text-primary">
                  Auto: EUR {autoPrice.toLocaleString()}
                </span>
              )}
            </label>
            <input
              type="number"
              name="totalPrice"
              step="0.01"
              placeholder={autoPrice ? `${autoPrice}` : "Enter price..."}
              defaultValue={booking?.totalPrice || ""}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {isEdit && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Status
              </label>
              <select
                name="status"
                defaultValue={booking?.status || "pending"}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
