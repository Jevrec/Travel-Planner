"use client";

import { Search, SlidersHorizontal, Star } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import BookingForm from "./BookingForm";

export type UserDestination = {
  _id: string;
  name?: string;
  country?: string;
  city?: string;
  description?: string;
  pricePerNight?: number;
  rating?: number;
  tags?: string[];
  imageUrl?: string;
};

export default function DestinationCatalog({
  destinations,
}: {
  destinations: UserDestination[];
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name");

  const filtered = useMemo(() => {
    const query = search.toLowerCase();

    return destinations
      .filter((destination) =>
        [
          destination.name,
          destination.city,
          destination.country,
          ...(destination.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => {
        if (sortBy === "price") {
          return (a.pricePerNight || 0) - (b.pricePerNight || 0);
        }
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [destinations, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search destinations"
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
          <SlidersHorizontal size={17} />
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as "name" | "price" | "rating")
            }
            className="bg-transparent font-medium outline-none"
          >
            <option value="name">Name</option>
            <option value="price">Lowest price</option>
            <option value="rating">Top rating</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No destinations match your search.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((destination) => (
            <article
              key={destination._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid md:grid-cols-[220px_1fr]">
                <div className="h-56 bg-slate-100 md:h-full">
                  {destination.imageUrl ? (
                    <Image
                      src={destination.imageUrl}
                      alt={destination.name || "Destination"}
                      width={440}
                      height={360}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        {destination.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {[destination.city, destination.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                      <Star size={15} fill="currentColor" />
                      {destination.rating || "New"}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {destination.description || "A ready-to-book destination."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(destination.tags || []).slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <BookingForm
                    destinationId={destination._id}
                    pricePerNight={destination.pricePerNight || 0}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
