// app/actions/auth.ts
"use server";

import { writeClient, client } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";

type UpdateProfileState = {
  error?: string;
  success?: string;
  updatedName?: string;
};

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const username = email.split("@")[0]; // default username from email

  // Basic validation
  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Check if email already exists
  const existing = await client.fetch(
    `*[_type == "user" && email == $email][0]{ _id }`,
    { email },
  );

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user in Sanity
  await writeClient.create({
    _type: "user",
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  // Auto sign in after register
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });

  return { success: true };
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You need to be signed in." };
  }

  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!username) {
    return { error: "Name is required." };
  }

  if (password && password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (password && password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const patch: { username: string; password?: string } = { username };

  if (password) {
    patch.password = await bcrypt.hash(password, 12);
  }

  await writeClient.patch(userId).set(patch).commit();

  return {
    success: password
      ? "Your profile and password were updated."
      : "Your profile was updated.",
    updatedName: username,
  };
}
