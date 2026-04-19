"use server";

import { client } from "@/sanity/lib/client";
import { resend } from "@/lib/resend";

export async function getAllCustomerEmails() {
  return await client.fetch(`
    *[_type == "user" && isAdmin != true]{ _id, username, email }
  `);
}

export async function sendNewsletterEmail(subject: string, message: string) {
  const customers = await getAllCustomerEmails();

  if (!customers.length) return { error: "No customers found." };

  const results = { success: 0, failed: 0 };

  for (const customer of customers) {
    if (!customer.email) continue;
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@traveladmin.com",
        to: customer.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #3f639e; padding: 30px 40px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">✈️ TravelAdmin</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #1f2937; font-size: 16px;">Hi ${customer.username || "there"},</p>
              <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                ${message.replace(/\n/g, "<br/>")}
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 TravelAdmin. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });
      results.success++;
    } catch {
      results.failed++;
    }
  }

  return results;
}

export async function getSentEmails() {
  // Resend nima direktnega API za zgodovino, shranjujemo v Sanity
  return await client.fetch(`
    *[_type == "sentEmail"] | order(sentAt desc) {
      _id, subject, sentAt, recipientCount, status
    }
  `);
}

export async function saveSentEmail(subject: string, recipientCount: number, status: string) {
  const { writeClient } = await import("@/sanity/lib/client");
  await writeClient.create({
    _type: "sentEmail",
    subject,
    recipientCount,
    status,
    sentAt: new Date().toISOString(),
  });
}