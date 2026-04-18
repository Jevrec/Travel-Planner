// app/actions/import.ts
"use server";

import { writeClient, client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

type DestinationRow = {
  name: string;
  country: string;
  city: string;
  description?: string;
  pricePerNight: number;
  lat?: number;
  lon?: number;
  rating?: number;
  tags?: string;
};

type ImportResult = {
  success: number;
  skipped: number;
  errors: { row: number; reason: string }[];
};

function validateRow(
  row: any,
  index: number,
): { valid: boolean; error?: string } {
  if (!row.name || typeof row.name !== "string" || row.name.trim() === "") {
    return {
      valid: false,
      error: `Row ${index + 1}: Missing or invalid 'name'`,
    };
  }
  if (!row.country || typeof row.country !== "string") {
    return { valid: false, error: `Row ${index + 1}: Missing 'country'` };
  }
  if (!row.city || typeof row.city !== "string") {
    return { valid: false, error: `Row ${index + 1}: Missing 'city'` };
  }
  const price = parseFloat(row.pricePerNight);
  if (isNaN(price) || price < 0) {
    return { valid: false, error: `Row ${index + 1}: Invalid 'pricePerNight'` };
  }
  return { valid: true };
}

export async function importDestinations(
  rows: DestinationRow[],
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Validacija
    const validation = validateRow(row, i);
    if (!validation.valid) {
      result.errors.push({ row: i + 1, reason: validation.error! });
      continue;
    }

    // Preveri duplikate (isto ime + mesto)
    const existing = await client.fetch(
      `*[_type == "destination" && name == $name && city == $city][0]{ _id }`,
      { name: row.name.trim(), city: row.city.trim() },
    );

    if (existing) {
      result.skipped++;
      continue;
    }

    // Ustvari destinacijo
    try {
      await writeClient.create({
        _type: "destination",
        name: row.name.trim(),
        country: row.country.trim(),
        city: row.city.trim(),
        description: row.description?.trim() || "",
        pricePerNight: parseFloat(row.pricePerNight.toString()),
        lat: row.lat ? parseFloat(row.lat.toString()) : undefined,
        lon: row.lon ? parseFloat(row.lon.toString()) : undefined,
        rating: row.rating ? parseFloat(row.rating.toString()) : undefined,
        tags: row.tags
          ? row.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
      });
      result.success++;
    } catch (e) {
      result.errors.push({ row: i + 1, reason: "Failed to save to database" });
    }
  }

  revalidatePath("/admin/destinations");
  revalidatePath("/admin");
  return result;
}
