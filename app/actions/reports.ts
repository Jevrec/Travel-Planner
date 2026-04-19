"use server";

import { client } from "@/sanity/lib/client";

type ReportBooking = {
  _id: string;
  status?: string;
  totalPrice?: number;
  createdAt: string;
  startDate?: string;
  destinationName?: string;
  destinationCountry?: string;
  customerId?: string;
};

type ReportCustomer = {
  _id: string;
  createdAt: string;
};

export async function getReportsData() {
  const [bookings, destinations, customers] = await Promise.all([
    client.fetch<ReportBooking[]>(`*[_type == "booking"]{
      _id, status, totalPrice, createdAt, startDate,
      "destinationName": destination->name,
      "destinationCountry": destination->country,
      "customerId": customer->_id,
    }`),
    client.fetch<
      {
        _id: string;
        name?: string;
        country?: string;
        pricePerNight?: number;
        rating?: number;
      }[]
    >(`*[_type == "destination"]{ _id, name, country, pricePerNight, rating }`),
    client.fetch<ReportCustomer[]>(
      `*[_type == "user" && isAdmin != true]{ _id, createdAt }`,
    ),
  ]);

  const revenueByMonth = getLast12MonthsRevenue(bookings);
  const bookingsByStatus = getBookingsByStatus(bookings);
  const topDestinations = getTopDestinations(bookings);

  const conversionRate =
    bookings.length > 0
      ? Math.round(
          (bookings.filter(
            (b) => b.status === "confirmed" || b.status === "completed",
          ).length /
            bookings.length) *
            100,
        )
      : 0;

  const completedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed",
  );
  const avgBookingValue =
    completedBookings.length > 0
      ? Math.round(
          completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) /
            completedBookings.length,
        )
      : 0;

  const newCustomersByMonth = getNewCustomersByMonth(customers);

  return {
    revenueByMonth,
    bookingsByStatus,
    topDestinations,
    conversionRate,
    avgBookingValue,
    newCustomersByMonth,
    totalBookings: bookings.length,
    totalDestinations: destinations.length,
    totalCustomers: customers.length,
  };
}

function getLast12MonthsRevenue(bookings: ReportBooking[]) {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("sl-SI", {
      month: "short",
      year: "2-digit",
    });
    const revenue = bookings
      .filter((b) => {
        const bd = new Date(b.createdAt);
        return (
          bd.getMonth() === d.getMonth() &&
          bd.getFullYear() === d.getFullYear() &&
          (b.status === "confirmed" || b.status === "completed")
        );
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    months.push({ month: label, revenue });
  }
  return months;
}

function getBookingsByStatus(bookings: ReportBooking[]) {
  const map: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
  bookings.forEach((b) => {
    if (b.status && map[b.status] !== undefined) map[b.status]++;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function getTopDestinations(bookings: ReportBooking[]) {
  const map: Record<string, { count: number; revenue: number }> = {};
  bookings.forEach((b) => {
    const name = b.destinationName || "Unknown";
    if (!map[name]) map[name] = { count: 0, revenue: 0 };
    map[name].count++;
    if (b.status === "confirmed" || b.status === "completed") {
      map[name].revenue += b.totalPrice || 0;
    }
  });
  return Object.entries(map)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function getNewCustomersByMonth(customers: ReportCustomer[]) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("sl-SI", { month: "short" });
    const count = customers.filter((c) => {
      const cd = new Date(c.createdAt);
      return (
        cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
      );
    }).length;
    months.push({ month: label, count });
  }
  return months;
}
