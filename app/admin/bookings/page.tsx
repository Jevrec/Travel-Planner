// app/admin/bookings/page.tsx
import {
  getBookings,
  getCustomersAndDestinations,
} from "@/app/actions/bookings";
import BookingsClient from "@/app/components/admin/bookings/BookingsClient";

export default async function BookingsPage() {
  const [bookings, { customers, destinations }] = await Promise.all([
    getBookings(),
    getCustomersAndDestinations(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {bookings.length} total bookings
          </p>
        </div>
      </div>
      <BookingsClient
        initialBookings={bookings}
        customers={customers}
        destinations={destinations}
      />
    </div>
  );
}
