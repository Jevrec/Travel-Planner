// components/admin/bookings/BookingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createBooking, updateBooking } from "@/app/actions/bookings";

type Customer = { _id: string; username: string; email: string };
type Destination = {
  _id: string;
  name: string;
  country: string;
  pricePerNight: number;
};

export default function BookingModal({
  booking,
  customers,
  destinations,
  onClose,
  onSaved,
}: {
  booking: any | null;
  customers: Customer[];
  destinations: Destination[];
  onClose: () => void;
  onSaved: (b: any) => void;
}) {
  const isEdit = !!booking;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-price izračun
  const [selectedDest, setSelectedDest] = useState(
    booking?.destinationId || "",
  );
  const [startDate, setStartDate] = useState(
    booking?.startDate ? booking.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    booking?.endDate ? booking.endDate.slice(0, 10) : "",
  );
  const [guests, setGuests] = useState(booking?.guests || 1);
  const [autoPrice, setAutoPrice] = useState<number | null>(null);

  useEffect(() => {
    if (selectedDest && startDate && endDate) {
      const dest = destinations.find((d) => d._id === selectedDest);
      if (dest?.pricePerNight) {
        const nights = Math.max(
          1,
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            86400000,
        );
        setAutoPrice(Math.round(dest.pricePerNight * nights * guests));
      }
    }
  }, [selectedDest, startDate, endDate, guests, destinations]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (autoPrice && !formData.get("totalPrice")) {
      formData.set("totalPrice", autoPrice.toString());
    }

    const result = isEdit
      ? await updateBooking(booking._id, formData)
      : await createBooking(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // Optimistično posodobi UI
      const dest = destinations.find((d) => d._id === selectedDest);
      const customer = customers.find(
        (c) => c._id === formData.get("customerId"),
      );
      onSaved({
        ...booking,
        _id: booking?._id || "temp-" + Date.now(),
        status: formData.get("status") || "pending",
        totalPrice:
          parseFloat(formData.get("totalPrice") as string) || autoPrice,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        guests: parseInt(formData.get("guests") as string),
        flightIncluded: formData.get("flightIncluded") === "true",
        customerName: customer?.username,
        customerEmail: customer?.email,
        customerId: customer?._id,
        destinationName: dest?.name,
        destinationId: dest?._id,
        destinationCountry: dest?.country,
        createdAt: booking?.createdAt || new Date().toISOString(),
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Booking" : "New Booking"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Customer
            </label>
            <select
              name="customerId"
              required
              defaultValue={booking?.customerId || ""}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.username} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Destination
            </label>
            <select
              name="destinationId"
              required
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select destination...</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </div>

          {/* Datumi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Guests + Flight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Guests
              </label>
              <input
                type="number"
                name="guests"
                min={1}
                required
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Flight Included
              </label>
              <select
                name="flightIncluded"
                defaultValue={booking?.flightIncluded ? "true" : "false"}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          {/* Cena — auto izračun */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Total Price (€)
              {autoPrice && (
                <span className="ml-2 text-primary font-medium">
                  → Auto: €{autoPrice.toLocaleString()}
                </span>
              )}
            </label>
            <input
              type="number"
              name="totalPrice"
              step="0.01"
              placeholder={autoPrice ? `${autoPrice}` : "Enter price..."}
              defaultValue={booking?.totalPrice || ""}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status (samo pri editu) */}
          {isEdit && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Status
              </label>
              <select
                name="status"
                defaultValue={booking?.status || "pending"}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="flex-1 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60"
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
