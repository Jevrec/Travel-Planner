import { getBookingsForUser, getUserTravelStats } from "@/app/actions/bookings";
import { getDestinations } from "@/app/actions/destinations";
import { getDestinationImageUrl } from "@/app/components/user/destinationImages";
import UserStatCard from "@/app/components/user/UserStatCard";
import { auth } from "@/lib/auth";
import { CalendarCheck, Compass, Euro, Plane } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UserDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [destinations, bookings, stats] = await Promise.all([
    getDestinations(),
    getBookingsForUser(userId),
    getUserTravelStats(userId),
  ]);

  const upcoming = bookings.find(
    (booking: { startDate?: string; status?: string }) =>
      booking.startDate &&
      new Date(booking.startDate) >= new Date() &&
      booking.status !== "cancelled",
  );
  const recommended = destinations.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-primary p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm text-sky-100">Welcome back</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {session.user.name || "Traveler"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50">
              Browse available destinations, send booking requests, and track
              every trip from your personal travel hub.
            </p>
          </div>
          <Link
            href="/user/destinations"
            className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-sky-50"
          >
            Explore destinations
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UserStatCard
          title="Total bookings"
          value={stats.totalBookings}
          icon={CalendarCheck}
        />
        <UserStatCard
          title="Upcoming trips"
          value={stats.upcomingTrips}
          icon={Plane}
        />
        <UserStatCard
          title="Confirmed"
          value={stats.confirmedTrips}
          icon={Compass}
        />
        <UserStatCard
          title="Total spent"
          value={`EUR ${stats.totalSpent.toLocaleString()}`}
          icon={Euro}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950">
              Recommended destinations
            </h2>
            <Link
              href="/user/destinations"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {recommended.map(
              (destination: {
                _id: string;
                name?: string;
                city?: string;
                country?: string;
                pricePerNight?: number;
                imageUrl?: string;
              }) => (
                <Link
                  key={destination._id}
                  href="/user/destinations"
                  className="overflow-hidden rounded-xl border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-36 bg-slate-100">
                    <Image
                      src={getDestinationImageUrl(destination)}
                      alt={destination.name || "Destination"}
                      width={320}
                      height={220}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-950">
                      {destination.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {[destination.city, destination.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-primary">
                      EUR {destination.pricePerNight || 0}/night
                    </p>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Next trip</h2>
          {upcoming ? (
            <div className="mt-5">
              <p className="text-xl font-bold text-slate-950">
                {upcoming.destinationName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {upcoming.destinationCity}, {upcoming.destinationCountry}
              </p>
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                {formatDate(upcoming.startDate)} -{" "}
                {formatDate(upcoming.endDate)}
              </div>
              <Link
                href="/user/bookings"
                className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View booking
              </Link>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              No upcoming trips yet. Start with a destination that fits your
              next free week.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
