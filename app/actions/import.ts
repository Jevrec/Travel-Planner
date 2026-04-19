"use server";

import { writeClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

type DestinationImportRow = {
  name?: string | number;
  country?: string | number;
  city?: string | number;
  description?: string | number;
  pricePerNight?: string | number;
  rating?: string | number;
  lat?: string | number;
  lon?: string | number;
  tags?: string | number;
};

export async function importDestinations(rows: DestinationImportRow[]) {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const row of rows) {
    try {
      if (!row.name || !row.country) {
        results.failed++;
        results.errors.push(`Skipped row — missing name or country: ${JSON.stringify(row)}`);
        continue;
      }

      await writeClient.create({
        _type: "destination",
        name: String(row.name || ""),
        country: String(row.country || ""),
        city: String(row.city || ""),
        description: String(row.description || ""),
        pricePerNight: parseFloat(String(row.pricePerNight ?? "")) || 0,
        rating: parseFloat(String(row.rating ?? "")) || 0,
        lat: parseFloat(String(row.lat ?? "")) || 0,
        lon: parseFloat(String(row.lon ?? "")) || 0,
        tags: row.tags ? String(row.tags).split(",").map((t: string) => t.trim()) : [],
      });

      results.success++;
    } catch (err: unknown) {
      results.failed++;
      results.errors.push(err instanceof Error ? err.message : "Unknown import error");
    }
  }

  revalidatePath("/admin/destinations");
  return results;
}
