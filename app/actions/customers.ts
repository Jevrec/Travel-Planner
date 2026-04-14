"use server";

import { writeClient, client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  return await client.fetch(`
    *[_type == "user" && isAdmin != true] | order(createdAt desc) {
      _id, username, email, createdAt,
      "bookingsCount": count(*[_type == "booking" && references(^._id)]),
      "totalSpent": math::sum(*[_type == "booking" && references(^._id) 
        && (status == "confirmed" || status == "completed")].totalPrice)
    }
  `);
}

export async function deleteCustomer(id: string) {
  await writeClient.delete(id);
  revalidatePath("/admin/customers");
  return { success: true };
}