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
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);

  const filtered = destinations.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.country?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = (updated: Destination) => {
    setDestinations((prev) => {
      const exists = prev.find((d) => d._id === updated._id);
      if (exists) return prev.map((d) => (d._id === updated._id ? updated : d));
      return [updated, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d._id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input
          placeholder="Search destinations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> New Destination
        </button>
      </div>

      <DestinationsTable
        destinations={filtered}
        onEdit={(d: Destination) => { setEditing(d); setModalOpen(true); }}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <DestinationModal
          destination={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}