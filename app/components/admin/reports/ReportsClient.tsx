"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, Percent } from "lucide-react";

const COLORS = ["#3f639e", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#34d399",
  pending: "#f59e0b",
  cancelled: "#f87171",
  completed: "#3f639e",
};

export default function ReportsClient({ data }: { data: any }) {
  return (
    <div className="space-y-6">

      {/* KPI kartice */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Booking Value"
          value={`€${data.avgBookingValue?.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          icon={Percent}
          color="green"
        />
        <StatCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Bookings"
          value={data.totalBookings}
          icon={ShoppingBag}
          color="orange"
        />
      </div>

      {/* Revenue 12 mesecev */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Revenue — Last 12 Months</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Bar dataKey="revenue" fill="#3f639e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Novi kupci + Bookings po statusu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">New Customers — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.newCustomersByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone" dataKey="count"
                stroke="#3f639e" strokeWidth={2}
                dot={{ fill: "#3f639e", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.bookingsByStatus} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={80}>
                {data.bookingsByStatus.map((entry: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top destinacije */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top 5 Destinations by Revenue</h2>
        <div className="space-y-3">
          {data.topDestinations.map((dest: any, i: number) => {
            const maxRevenue = data.topDestinations[0]?.revenue || 1;
            const pct = Math.round((dest.revenue / maxRevenue) * 100);
            return (
              <div key={dest.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs
                      flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-800">{dest.name}</span>
                    <span className="text-xs text-gray-400">{dest.count} bookings</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    €{dest.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {data.topDestinations.length === 0 && (
            <p className="text-center text-gray-400 py-8">No data yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
};

function StatCard({ title, value, icon: Icon, color }: {
  title: string; value: string | number;
  icon: any; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${STAT_COLORS[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}