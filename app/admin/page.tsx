// app/admin/page.tsx
import { getDashboardStats } from "@/app/actions/admin";
import KPICard from "../components/admin/KPICard";
import BookingsTable from "../components/admin/BookingsTable";
import RevenueChart from "../components/admin/RevenueChart";
import DestinationPieChart from "../components/admin/DestinationPieChart";
import { Euro, CalendarCheck, Users } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* KPI kartice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          icon={Euro}
          color="blue"
        />
        <KPICard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={CalendarCheck}
          color="green"
        />
        <KPICard
          title="This Month"
          value={stats.bookingsThisMonth}
          icon={CalendarCheck}
          color="purple"
        />
        <KPICard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Grafi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Revenue (last 6 months)
          </h2>
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Bookings by Destination
          </h2>
          <DestinationPieChart data={stats.bookingsByDestination} />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
        <BookingsTable bookings={stats.recentBookings} />
      </div>
    </div>
  );
}
