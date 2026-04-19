// app/actions/bookings.ts
"use server";

import { revalidatePath } from "next/cache";
import { sendBookingConfirmation } from "@/app/actions/email";
import { writeClient, client } from "@/sanity/lib/client";

export async function getBookings() {
  return client.fetch(`
    *[_type == "booking"] | order(createdAt desc) {
      _id, status, totalPrice, createdAt,
      startDate, endDate, guests, flightIncluded,
      "customerName": customer->username,
      "customerEmail": customer->email,
      "customerId": customer->_id,
      "destinationName": destination->name,
      "destinationId": destination->_id,
      "destinationCountry": destination->country,
    }
  `);
}

export async function getBookingById(id: string) {
  return client.fetch(
    `
    *[_type == "booking" && _id == $id][0] {
      _id, status, totalPrice, createdAt,
      startDate, endDate, guests, flightIncluded,
      "customerName": customer->username,
      "customerEmail": customer->email,
      "customerId": customer->_id,
      "destinationName": destination->name,
      "destinationId": destination->_id,
      "destinationCountry": destination->country,
    }
  `,
    { id },
  );
}

export async function createBooking(formData: FormData) {
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const guests = parseInt(formData.get("guests") as string);
  const customerId = formData.get("customerId") as string;
  const destinationId = formData.get("destinationId") as string;
  const flightIncluded = formData.get("flightIncluded") === "true";

  if (!startDate || !endDate || !customerId || !destinationId) {
    return { error: "All fields are required." };
  }

  await writeClient.create({
    _type: "booking",
    status: "pending",
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    totalPrice,
    guests,
    flightIncluded,
    customer: { _type: "reference", _ref: customerId },
    destination: { _type: "reference", _ref: destinationId },
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  const existing = await client.fetch(
    `*[_type == "booking" && _id == $id][0]{ status }`,
    { id },
  );

  await writeClient.patch(id).set({ status }).commit();

  if (status === "confirmed" && existing?.status !== "confirmed") {
    await sendBookingConfirmation(id);
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function updateBooking(id: string, formData: FormData) {
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const guests = parseInt(formData.get("guests") as string);
  const status = formData.get("status") as string;
  const flightIncluded = formData.get("flightIncluded") === "true";
  const existing = await client.fetch(
    `*[_type == "booking" && _id == $id][0]{ status }`,
    { id },
  );

  await writeClient
    .patch(id)
    .set({ startDate, endDate, totalPrice, guests, status, flightIncluded })
    .commit();

  if (status === "confirmed" && existing?.status !== "confirmed") {
    await sendBookingConfirmation(id);
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteBooking(id: string) {
  await writeClient.delete(id);
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function getCustomersAndDestinations() {
  const [customers, destinations] = await Promise.all([
    client.fetch(
      `*[_type == "user" && isAdmin != true]{ _id, username, email }`,
    ),
    client.fetch(
      `*[_type == "destination"]{ _id, name, country, pricePerNight }`,
    ),
  ]);
  return { customers, destinations };
}
