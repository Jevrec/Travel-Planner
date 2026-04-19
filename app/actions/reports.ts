"use server";

import { client } from "@/sanity/lib/client";

export async function getReportsData() {
  const [bookings, destinations, customers] = await Promise.all([
    client.fetch(`*[_type == "booking"]{
      _id, status, totalPrice, createdAt, startDate,
      "destinationName": destination->name,
      "destinationCountry": destination->country,
      "customerId": customer->_id,
    }`),
    client.fetch(`*[_type == "destination"]{ _id, name, country, pricePerNight, rating }`),
    client.fetch(`*[_type == "user" && isAdmin != true]{ _id, createdAt }`),
  ]);

  // Prihodki po mesecih (zadnjih 12)
  const revenueByMonth = getLast12MonthsRevenue(bookings);

  // Bookings po statusu
  const bookingsByStatus = getBookingsByStatus(bookings);

  // Top destinacije po prihodku
  const topDestinations = getTopDestinations(bookings);

  // Konverzijska stopnja
  const conversionRate = bookings.length > 0
    ? Math.round((bookings.filter((b: any) =>
        b.status === "confirmed" || b.status === "completed"
      ).length / bookings.length) * 100)
    : 0;

  // Povprečna vrednost bookinga
  const avgBookingValue = bookings.length > 0
    ? Math.round(
        bookings
          .filter((b: any) => b.status === "confirmed" || b.status === "completed")
          .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0) /
        bookings.filter((b: any) =>
          b.status === "confirmed" || b.status === "completed"
        ).length
      )
    : 0;

  // Novi kupci po mesecih
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

function getLast12MonthsRevenue(bookings: any[]) {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("sl-SI", { month: "short", year: "2-digit" });
    const revenue = bookings
      .filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === d.getMonth() &&
          bd.getFullYear() === d.getFullYear() &&
          (b.status === "confirmed" || b.status === "completed");
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    months.push({ month: label, revenue });
  }
  return months;
}

function getBookingsByStatus(bookings: any[]) {
  const map: Record<string, number> = {
    pending: 0, confirmed: 0, cancelled: 0, completed: 0,
  };
  bookings.forEach((b) => {
    if (map[b.status] !== undefined) map[b.status]++;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function getTopDestinations(bookings: any[]) {
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

function getNewCustomersByMonth(customers: any[]) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("sl-SI", { month: "short" });
    const count = customers.filter((c) => {
      const cd = new Date(c.createdAt);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    months.push({ month: label, count });
  }
  return months;
}