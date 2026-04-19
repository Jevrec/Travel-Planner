"use server";

import { writeClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function importDestinations(rows: any[]) {
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
        pricePerNight: parseFloat(row.pricePerNight) || 0,
        rating: parseFloat(row.rating) || 0,
        lat: parseFloat(row.lat) || 0,
        lon: parseFloat(row.lon) || 0,
        tags: row.tags ? String(row.tags).split(",").map((t: string) => t.trim()) : [],
      });

      results.success++;
    } catch (err: any) {
      results.failed++;
      results.errors.push(err.message);
    }
  }

  revalidatePath("/admin/destinations");
  return results;
}