"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import DestinationsTable from "@/app/components/admin/destinations/DestinationsTable";
import DestinationModal from "@/app/components/admin/destinations/DestinationModal";

export type Destination = {
  _id: string;
  name: string;
  country: string;
  city: string;
  description: string;
  pricePerNight: number;
  rating: number;
  tags: string[];
  lat: number;
  lon: number;
  imageUrl?: string;
};

export default function DestinationsClient({
  initialDestinations,
}: {
  initialDestinations: Destination[];
}) {
  const [destinations, setDestinations] =
    useState<Destination[]>(initialDestinations);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "pricePerNight" | "rating">(
    "name",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);

  const filtered = destinations
    .filter(
      (destination) =>
        destination.name?.toLowerCase().includes(search.toLowerCase()) ||
        destination.country?.toLowerCase().includes(search.toLowerCase()) ||
        destination.city?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "pricePerNight") {
        return (b.pricePerNight || 0) - (a.pricePerNight || 0);
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const handleSaved = (updated: Destination) => {
    setDestinations((prev) => {
      const exists = prev.find((destination) => destination._id === updated._id);
      if (exists) {
        return prev.map((destination) =>
          destination._id === updated._id ? updated : destination,
        );
      }
      return [updated, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setDestinations((prev) =>
      prev.filter((destination) => destination._id !== id),
    );
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "pricePerNight" | "rating")
            }
            className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="name">Sort: Name</option>
            <option value="pricePerNight">Sort: Price</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={16} /> New Destination
        </button>
      </div>

      <DestinationsTable
        destinations={filtered}
        onEdit={(destination: Destination) => {
          setEditing(destination);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <DestinationModal
          destination={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
