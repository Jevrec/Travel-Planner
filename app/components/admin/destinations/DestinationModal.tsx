"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createDestination, updateDestination } from "@/app/actions/destinations";
import { Destination } from "./DestinationsClient";

export default function DestinationModal({
  destination, onClose, onSaved,
}: {
  destination: Destination | null;
  onClose: () => void;
  onSaved: (d: Destination) => void;
}) {
  const isEdit = !!destination;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateDestination(destination._id, formData)
      : await createDestination(formData);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      const tags = (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean);
      onSaved({
        ...destination,
        _id: destination?._id || "temp-" + Date.now(),
        name: formData.get("name") as string,
        country: formData.get("country") as string,
        city: formData.get("city") as string,
        description: formData.get("description") as string,
        pricePerNight: parseFloat(formData.get("pricePerNight") as string),
        rating: parseFloat(formData.get("rating") as string),
        lat: parseFloat(formData.get("lat") as string),
        lon: parseFloat(formData.get("lon") as string),
        tags,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Destination" : "New Destination"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Name *</label>
              <input name="name" required defaultValue={destination?.name || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Country *</label>
              <input name="country" required defaultValue={destination?.country || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
            <input name="city" defaultValue={destination?.city || ""}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea name="description" rows={3} defaultValue={destination?.description || ""}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price/Night (€)</label>
              <input type="number" name="pricePerNight" step="0.01" min="0"
                defaultValue={destination?.pricePerNight || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Rating (0–5)</label>
              <input type="number" name="rating" step="0.1" min="0" max="5"
                defaultValue={destination?.rating || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Latitude</label>
              <input type="number" name="lat" step="any"
                defaultValue={destination?.lat || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Longitude</label>
              <input type="number" name="lon" step="any"
                defaultValue={destination?.lon || ""}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Tags <span className="text-gray-400">(comma separated)</span>
            </label>
            <input name="tags" placeholder="beach, luxury, family..."
              defaultValue={destination?.tags?.join(", ") || ""}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}