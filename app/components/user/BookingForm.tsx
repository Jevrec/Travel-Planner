"use client";

import { createUserBooking } from "@/app/actions/bookings";
import { CalendarPlus, Plane } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

type BookingState = { error?: string; success?: boolean };

async function submitBooking(
  _state: BookingState,
  formData: FormData,
): Promise<BookingState> {
  return createUserBooking(formData);
}

export default function BookingForm({
  destinationId,
  pricePerNight,
}: {
  destinationId: string;
  pricePerNight: number;
}) {
  const [state, action, pending] = useActionState(submitBooking, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={action} className="mt-4 space-y-3">
      <input type="hidden" name="destinationId" value={destinationId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Start
          <input
            name="startDate"
            type="date"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          End
          <input
            name="endDate"
            type="date"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="text-sm font-medium text-slate-700">
          Travelers
          <input
            name="guests"
            type="number"
            min="1"
            max="12"
            defaultValue="1"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <label className="flex items-end gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          <input name="flightIncluded" type="checkbox" value="true" />
          <Plane size={16} />
          Flight
        </label>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Booking request sent.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <CalendarPlus size={17} />
        {pending ? "Sending..." : `Book from EUR ${pricePerNight}/night`}
      </button>
    </form>
  );
}
