// components/admin/bookings/BookingsClient.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BookingsTable from "./BookingsTable";
import BookingModal from "./BookingModal";
import BookingFilters from "./BookingFilters";

type Booking = {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  guests: number;
  flightIncluded: boolean;
  customerName: string;
  customerEmail: string;
  customerId: string;
  destinationName: string;
  destinationId: string;
  destinationCountry: string;
};

type Customer = { _id: string; username: string; email: string };
type Destination = {
  _id: string;
  name: string;
  country: string;
  pricePerNight: number;
};

export default function BookingsClient({
  initialBookings,
  customers,
  destinations,
}: {
  initialBookings: Booking[];
  customers: Customer[];
  destinations: Destination[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "totalPrice" | "startDate"
  >("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const filtered = bookings
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.customerName?.toLowerCase().includes(q) ||
        b.destinationName?.toLowerCase().includes(q) ||
        b.destinationCountry?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let valA: number, valB: number;
      if (sortBy === "totalPrice") {
        valA = a.totalPrice || 0;
        valB = b.totalPrice || 0;
      } else if (sortBy === "startDate") {
        valA = new Date(a.startDate).getTime();
        valB = new Date(b.startDate).getTime();
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      return sortDir === "desc" ? valB - valA : valA - valB;
    });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  const handleStatusChange = (id: string, status: string) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b)),
    );
  };

  const handleSaved = (updated: Booking) => {
    setBookings((prev) => {
      const exists = prev.find((b) => b._id === updated._id);
      if (exists) return prev.map((b) => (b._id === updated._id ? updated : b));
      return [updated, ...prev];
    });
    setModalOpen(false);
    setEditingBooking(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BookingFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />
        <button
          onClick={() => {
            setEditingBooking(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      <BookingsTable
        bookings={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {modalOpen && (
        <BookingModal
          booking={editingBooking}
          customers={customers}
          destinations={destinations}
          onClose={() => {
            setModalOpen(false);
            setEditingBooking(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
