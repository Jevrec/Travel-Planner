"use client";

import { useState } from "react";
import { Pencil, Trash2, Star, MapPin } from "lucide-react";
import { deleteDestination } from "@/app/actions/destinations";
import { Destination } from "./DestinationsClient";

export default function DestinationsTable({
  destinations, onEdit, onDelete,
}: {
  destinations: Destination[];
  onEdit: (d: Destination) => void;
  onDelete: (id: string) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteDestination(id);
    onDelete(id);
    setConfirmDelete(null);
    setLoadingId(null);
  };

  if (destinations.length === 0) {
    return <p className="text-center text-gray-400 py-12">No destinations found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Destination</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Price/Night</th>
              <th className="pb-3 font-medium">Rating</th>
              <th className="pb-3 font-medium">Tags</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {destinations.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50 transition">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {d.imageUrl ? (
                      <img src={d.imageUrl} alt={d.name}
                        className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{d.name}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">
                  <p>{d.city || "—"}</p>
                  <p className="text-xs text-gray-400">{d.country}</p>
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  €{d.pricePerNight?.toLocaleString() || "—"}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={13} fill="currentColor" />
                    <span className="text-gray-700 text-sm">{d.rating?.toFixed(1) || "—"}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.tags?.slice(0, 3).map((tag) => (
                      <span key={tag}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {d.tags?.length > 3 && (
                      <span className="text-xs text-gray-400">+{d.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(d)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(d._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete destination?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                disabled={loadingId === confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                {loadingId === confirmDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}