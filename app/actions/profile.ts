"use server";

import { auth } from "@/lib/auth";
import { client, writeClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

export async function getCurrentUserProfile() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  return client.fetch(
    `
    *[_type == "user" && _id == $userId][0] {
      _id,
      username,
      email,
      createdAt,
      "profileImageUrl": profileImage.asset->url
    }
  `,
    { userId },
  );
}

export async function updateCurrentUserProfile(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const username = String(formData.get("username") || "").trim();

  if (!userId) {
    return { error: "You need to be signed in to update your profile." };
  }

  if (username.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  await writeClient.patch(userId).set({ username }).commit();

  revalidatePath("/user");
  revalidatePath("/user/profile");
  return { success: true };
}
