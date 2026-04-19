"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Star, MapPin } from "lucide-react";
import { deleteDestination } from "@/app/actions/destinations";
import { Destination } from "./DestinationsClient";

type WeatherInfo = {
  temperature: number;
  label: string;
};

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Strong showers",
  82: "Violent showers",
  95: "Thunderstorm",
};

export default function DestinationsTable({
  destinations,
  onEdit,
  onDelete,
}: {
  destinations: Destination[];
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [weatherById, setWeatherById] = useState<Record<string, WeatherInfo>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      const withCoords = destinations.filter(
        (destination) =>
          Number.isFinite(destination.lat) && Number.isFinite(destination.lon),
      );

      const weatherEntries = await Promise.all(
        withCoords.map(async (destination) => {
          try {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lon}&current=temperature_2m,weather_code&timezone=auto`,
            );

            if (!response.ok) return null;

            const data = await response.json();
            return [
              destination._id,
              {
                temperature: Math.round(data.current?.temperature_2m ?? 0),
                label: WEATHER_LABELS[data.current?.weather_code] || "Weather",
              },
            ] as const;
          } catch {
            return null;
          }
        }),
      );

      if (!cancelled) {
        setWeatherById(
          Object.fromEntries(
            weatherEntries.filter(Boolean) as [string, WeatherInfo][],
          ),
        );
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [destinations]);

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteDestination(id);
    onDelete(id);
    setConfirmDelete(null);
    setLoadingId(null);
  };

  if (destinations.length === 0) {
    return (
      <p className="py-12 text-center text-gray-400">
        No destinations found.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-3 font-medium">Destination</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Price/Night</th>
              <th className="pb-3 font-medium">Rating</th>
              <th className="pb-3 font-medium">Weather</th>
              <th className="pb-3 font-medium">Tags</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {destinations.map((destination) => (
              <tr key={destination._id} className="transition hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {destination.imageUrl ? (
                      <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-800">
                      {destination.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">
                  <p>{destination.city || "-"}</p>
                  <p className="text-xs text-gray-400">{destination.country}</p>
                </td>
                <td className="py-3 font-semibold text-gray-800">
                  EUR {destination.pricePerNight?.toLocaleString() || "-"}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={13} fill="currentColor" />
                    <span className="text-sm text-gray-700">
                      {destination.rating?.toFixed(1) || "-"}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">
                  {weatherById[destination._id] ? (
                    <>
                      <p className="font-medium text-gray-800">
                        {weatherById[destination._id].temperature} C
                      </p>
                      <p className="text-xs text-gray-400">
                        {weatherById[destination._id].label}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No live data</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {destination.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {destination.tags?.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{destination.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(destination)}
                      className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(destination._id)}
                      className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                    >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Delete destination?</h3>
            <p className="mb-6 text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loadingId === confirmDelete}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-60"
              >
                {loadingId === confirmDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
