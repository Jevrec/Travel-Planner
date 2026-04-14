"use server";

import { writeClient, client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function getDestinations() {
  return await client.fetch(`
    *[_type == "destination"] | order(name asc) {
      _id, name, country, city, description,
      pricePerNight, rating, tags, lat, lon,
      "imageUrl": image.asset->url
    }
  `);
}

export async function createDestination(formData: FormData): Promise<{ error: string } | { success: boolean }> {
  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;
  const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
  const rating = parseFloat(formData.get("rating") as string);
  const lat = parseFloat(formData.get("lat") as string);
  const lon = parseFloat(formData.get("lon") as string);
  const tags = (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean);

  if (!name || !country) return { error: "Name and country are required." };

  await writeClient.create({
    _type: "destination",
    name, country, city, description,
    pricePerNight, rating, lat, lon, tags,
  });

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function updateDestination(id: string, formData: FormData): Promise<{ error: string } | { success: boolean }> {
  const tags = (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean);

  await writeClient.patch(id).set({
    name: formData.get("name"),
    country: formData.get("country"),
    city: formData.get("city"),
    description: formData.get("description"),
    pricePerNight: parseFloat(formData.get("pricePerNight") as string),
    rating: parseFloat(formData.get("rating") as string),
    lat: parseFloat(formData.get("lat") as string),
    lon: parseFloat(formData.get("lon") as string),
    tags,
  }).commit();

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function deleteDestination(id: string) {
  await writeClient.delete(id);
  revalidatePath("/admin/destinations");
  return { success: true };
}