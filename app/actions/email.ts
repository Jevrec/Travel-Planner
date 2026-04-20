"use server";

import { client } from "@/sanity/lib/client";
import { resend } from "@/lib/resend";

type BookingEmailData = {
  _id: string;
  customerName: string;
  customerEmail: string;
  destinationName: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  flightIncluded: boolean;
};

type BookingConfirmationTemplateData = Omit<
  BookingEmailData,
  "_id" | "customerEmail"
> & {
  bookingId: string;
};

type CustomerEmailData = {
  _id: string;
  username?: string;
  email?: string;
};

type SendNewsletterResult =
  | { error: string }
  | { success: number; failed: number; errors: string[] };

async function getBookingEmailData(
  bookingId: string,
): Promise<BookingEmailData | null> {
  return client.fetch(
    `
      *[_type == "booking" && _id == $bookingId][0]{
        _id,
        startDate,
        endDate,
        guests,
        totalPrice,
        flightIncluded,
        "customerName": customer->username,
        "customerEmail": customer->email,
        "destinationName": destination->name,
        "destinationCountry": destination->country
      }
    `,
    { bookingId },
  );
}

export async function getAllCustomerEmails(): Promise<CustomerEmailData[]> {
  return client.fetch(`
    *[_type == "user" && isAdmin != true]{ _id, username, email }
  `);
}

function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim();
}

export async function sendNewsletterEmail(
  subject: string,
  message: string,
): Promise<SendNewsletterResult> {
  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY is missing in .env.local." };
  }

  const from = getResendFromEmail();
  if (!from) {
    return { error: "RESEND_FROM_EMAIL is missing in .env.local." };
  }

  const customers = await getAllCustomerEmails();

  if (!customers.length) return { error: "No customers found." };

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const customer of customers) {
    if (!customer.email) continue;

    try {
      const { error } = await resend.emails.send({
        from,
        to: customer.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #3f639e; padding: 30px 40px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">TravelAdmin</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #1f2937; font-size: 16px;">Hi ${escapeHtml(customer.username || "there")},</p>
              <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                ${escapeHtml(message).replace(/\n/g, "<br/>")}
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Copyright 2025 TravelAdmin. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        results.failed++;
        results.errors.push(`${customer.email}: ${error.message}`);
        continue;
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `${customer.email}: ${
          error instanceof Error ? error.message : "Unknown email error"
        }`,
      );
    }
  }

  return results;
}

export async function sendBookingConfirmation(bookingId: string) {
  const booking = await getBookingEmailData(bookingId);

  if (!booking) {
    return { error: "Booking not found." };
  }

  if (!booking.customerEmail) {
    return { error: "Customer email is missing." };
  }

  const html = getBookingConfirmationHtml({
    customerName: booking.customerName || "Traveler",
    destinationName: booking.destinationName || "Destination",
    destinationCountry: booking.destinationCountry || "",
    startDate: booking.startDate,
    endDate: booking.endDate,
    guests: booking.guests || 1,
    totalPrice: booking.totalPrice || 0,
    flightIncluded: Boolean(booking.flightIncluded),
    bookingId: booking._id,
  });

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@traveladmin.com",
      to: booking.customerEmail,
      subject: `Booking confirmation: ${booking.destinationName}`,
      html,
    });

    return { success: true };
  } catch {
    return { error: "Failed to send booking confirmation email." };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("sl-SI");
}

function getBookingConfirmationHtml(booking: BookingConfirmationTemplateData) {
  const nights = Math.max(
    1,
    (new Date(booking.endDate).getTime() -
      new Date(booking.startDate).getTime()) /
      86400000,
  );

  const customerName = escapeHtml(booking.customerName);
  const destinationName = escapeHtml(booking.destinationName);
  const destinationCountry = escapeHtml(booking.destinationCountry);
  const bookingCode = escapeHtml(booking.bookingId.slice(-8).toUpperCase());

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="background-color: #3f639e; padding: 30px 40px;">
                <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">TravelAdmin</p>
                <p style="color: #c7d7f0; font-size: 14px; margin: 6px 0 0;">Booking Confirmation</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Hi <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280;">Your booking has been confirmed! Here are your trip details:</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; border-radius: 12px; padding: 24px; margin-top: 24px;">
                  <tr>
                    <td>
                      <p style="font-size: 18px; font-weight: bold; color: #3f639e; margin: 0 0 16px;">${destinationName}, ${destinationCountry}</p>
                      <table width="100%" cellpadding="6" cellspacing="0">
                        <tr><td style="color: #6b7280; font-size: 13px; width: 40%;">Check-in</td><td style="color: #1f2937; font-size: 13px; font-weight: bold;">${formatDate(booking.startDate)}</td></tr>
                        <tr><td style="color: #6b7280; font-size: 13px;">Check-out</td><td style="color: #1f2937; font-size: 13px; font-weight: bold;">${formatDate(booking.endDate)}</td></tr>
                        <tr><td style="color: #6b7280; font-size: 13px;">Duration</td><td style="color: #1f2937; font-size: 13px; font-weight: bold;">${nights} night${nights > 1 ? "s" : ""}</td></tr>
                        <tr><td style="color: #6b7280; font-size: 13px;">Guests</td><td style="color: #1f2937; font-size: 13px; font-weight: bold;">${booking.guests}</td></tr>
                        <tr><td style="color: #6b7280; font-size: 13px;">Flight</td><td style="color: #1f2937; font-size: 13px; font-weight: bold;">${booking.flightIncluded ? "Included" : "Not included"}</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                  <tr>
                    <td style="background-color: #3f639e; border-radius: 12px; padding: 20px 24px;">
                      <table width="100%">
                        <tr>
                          <td style="color: #c7d7f0; font-size: 13px;">Total Amount</td>
                          <td align="right" style="color: #ffffff; font-size: 22px; font-weight: bold;">EUR ${booking.totalPrice.toLocaleString()}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">Booking ID: #${bookingCode}</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">Questions? Contact us at support@traveladmin.com</p>
                <p style="font-size: 12px; color: #9ca3af; margin: 6px 0 0; text-align: center;">Copyright 2025 TravelAdmin. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function getSentEmails() {
  return client.fetch(`
    *[_type == "sentEmail"] | order(sentAt desc) {
      _id, subject, sentAt, recipientCount, status
    }
  `);
}

export async function saveSentEmail(
  subject: string,
  recipientCount: number,
  status: string,
) {
  const { writeClient } = await import("@/sanity/lib/client");
  await writeClient.create({
    _type: "sentEmail",
    subject,
    recipientCount,
    status,
    sentAt: new Date().toISOString(),
  });
}
