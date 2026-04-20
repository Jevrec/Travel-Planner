// app/actions/bookings.ts
"use server";

import { revalidatePath } from "next/cache";
import { sendBookingConfirmation } from "@/app/actions/email";
import { writeClient, client } from "@/sanity/lib/client";
import { auth } from "@/lib/auth";

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

export async function getBookingsForUser(userId: string) {
  if (!userId) return [];

  return client.fetch(
    `
    *[_type == "booking" && customer._ref == $userId] | order(createdAt desc) {
      _id, status, totalPrice, createdAt,
      startDate, endDate, guests, flightIncluded,
      "destinationName": destination->name,
      "destinationCity": destination->city,
      "destinationCountry": destination->country,
      "destinationImageUrl": destination->image.asset->url,
    }
  `,
    { userId },
  );
}

export async function getUserTravelStats(userId: string) {
  if (!userId) {
    return {
      totalBookings: 0,
      upcomingTrips: 0,
      confirmedTrips: 0,
      totalSpent: 0,
    };
  }

  const bookings = await client.fetch<
    { status?: string; startDate?: string; totalPrice?: number }[]
  >(
    `
    *[_type == "booking" && customer._ref == $userId] {
      status, startDate, totalPrice
    }
  `,
    { userId },
  );

  const now = new Date();

  return {
    totalBookings: bookings.length,
    upcomingTrips: bookings.filter(
      (booking) =>
        booking.startDate &&
        new Date(booking.startDate) >= now &&
        booking.status !== "cancelled",
    ).length,
    confirmedTrips: bookings.filter((booking) => booking.status === "confirmed")
      .length,
    totalSpent: bookings
      .filter(
        (booking) =>
          booking.status === "confirmed" || booking.status === "completed",
      )
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
  };
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

export async function createUserBooking(formData: FormData) {
  const session = await auth();
  const customerId = session?.user?.id;
  const destinationId = formData.get("destinationId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const guests = parseInt(formData.get("guests") as string);
  const flightIncluded = formData.get("flightIncluded") === "true";

  if (!customerId) {
    return { error: "You need to be signed in to book a trip." };
  }

  if (!destinationId || !startDate || !endDate || !guests) {
    return { error: "Choose a destination, dates, and number of travelers." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || nights < 1) {
    return { error: "End date must be after start date." };
  }

  if (guests < 1 || guests > 12) {
    return { error: "Choose between 1 and 12 travelers." };
  }

  const destination = await client.fetch(
    `*[_type == "destination" && _id == $destinationId][0]{
      _id, pricePerNight
    }`,
    { destinationId },
  );

  if (!destination) {
    return { error: "This destination is no longer available." };
  }

  const nightlyPrice = Number(destination.pricePerNight || 0);
  const flightFee = flightIncluded ? 180 * guests : 0;
  const totalPrice = nightlyPrice * nights * guests + flightFee;

  await writeClient.create({
    _type: "booking",
    status: "pending",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalPrice,
    guests,
    flightIncluded,
    customer: { _type: "reference", _ref: customerId },
    destination: { _type: "reference", _ref: destinationId },
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/user");
  revalidatePath("/user/bookings");
  revalidatePath("/user/destinations");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function cancelUserBooking(id: string) {
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) {
    return { error: "You need to be signed in to cancel a booking." };
  }

  const booking = await client.fetch(
    `
    *[_type == "booking" && _id == $id][0] {
      _id,
      status,
      "customerId": customer->_id
    }
  `,
    { id },
  );

  if (!booking || booking.customerId !== customerId) {
    return { error: "Booking not found." };
  }

  if (booking.status === "completed") {
    return { error: "Completed trips cannot be cancelled." };
  }

  await writeClient.patch(id).set({ status: "cancelled" }).commit();

  revalidatePath("/user");
  revalidatePath("/user/bookings");
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
