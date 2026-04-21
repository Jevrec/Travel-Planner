"use client";

import { cancelUserBooking } from "@/app/actions/bookings";
import { CalendarDays, Plane, Users } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { getDestinationImageUrl } from "./destinationImages";

export type UserBooking = {
  _id: string;
  status?: string;
  totalPrice?: number;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  flightIncluded?: boolean;
  destinationName?: string;
  destinationCity?: string;
  destinationCountry?: string;
  destinationImageUrl?: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-slate-100 text-slate-700",
};

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function UserBookingsClient({
  bookings,
}: {
  bookings: UserBooking[];
}) {
  const [items, setItems] = useState(bookings);
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel(id: string) {
    setMessage("");
    setPendingId(id);

    startTransition(async () => {
      const result = await cancelUserBooking(id);
      setPendingId(null);

      if (result?.error) {
        setMessage(result.error);
        return;
      }

      setItems((current) =>
        current.map((booking) =>
          booking._id === id ? { ...booking, status: "cancelled" } : booking,
        ),
      );
      setMessage("Booking cancelled.");
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-950">
          No bookings yet
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Choose a destination and send your first booking request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-primary">
          {message}
        </p>
      )}

      <div className="grid gap-4">
        {items.map((booking) => (
          <article
            key={booking._id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="grid md:grid-cols-[220px_1fr]">
              <div className="h-48 bg-slate-100 md:h-full">
                <Image
                  src={getDestinationImageUrl(booking)}
                  alt={booking.destinationName || "Destination"}
                  width={440}
                  height={320}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {booking.destinationName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {[booking.destinationCity, booking.destinationCountry]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      statusStyles[booking.status || ""] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {booking.status || "pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={17} />
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={17} />
                    {booking.guests || 1} travelers
                  </span>
                  <span className="flex items-center gap-2">
                    <Plane size={17} />
                    {booking.flightIncluded ? "Flight included" : "No flight"}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-lg font-bold text-slate-950">
                    EUR {(booking.totalPrice || 0).toLocaleString()}
                  </p>

                  {booking.status !== "cancelled" &&
                    booking.status !== "completed" && (
                      <button
                        type="button"
                        disabled={isPending && pendingId === booking._id}
                        onClick={() => handleCancel(booking._id)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {isPending && pendingId === booking._id
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
