// app/actions/admin.ts
"use server";
import { client } from "@/sanity/lib/client";

export async function getDashboardStats() {
  const [bookings, destinations, customers] = await Promise.all([
    client.fetch(`*[_type == "booking"]{
      _id, status, totalPrice, createdAt,
      "customerName": customer->username,
      "destinationName": destination->name
    } | order(createdAt desc)`),
    client.fetch(`*[_type == "destination"]{ _id, name, country }`),
    client.fetch(
      `*[_type == "user" && isAdmin != true]{ _id, email, username, createdAt }`,
    ),
  ]);

  const totalRevenue = bookings
    .filter((b: any) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const bookingsThisMonth = bookings.filter(
    (b: any) => new Date(b.createdAt) >= thisMonth,
  ).length;

  // Prihodki po mesecih (zadnjih 6)
  const revenueByMonth = getLast6MonthsRevenue(bookings);

  // Bookings po destinaciji
  const bookingsByDestination = getBookingsByDestination(bookings);

  return {
    totalRevenue,
    totalBookings: bookings.length,
    bookingsThisMonth,
    totalCustomers: customers.length,
    totalDestinations: destinations.length,
    recentBookings: bookings.slice(0, 10),
    revenueByMonth,
    bookingsByDestination,
    bookings,
    customers,
  };
}

function getLast6MonthsRevenue(bookings: any[]) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("sl-SI", { month: "short" });
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

function getBookingsByDestination(bookings: any[]) {
  const map: Record<string, number> = {};
  bookings.forEach((b) => {
    const name = b.destinationName || "Unknown";
    map[name] = (map[name] || 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}
