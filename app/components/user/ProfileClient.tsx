"use client";

import { updateCurrentUserProfile } from "@/app/actions/profile";
import { Save } from "lucide-react";
import Image from "next/image";
import { useActionState } from "react";

type ProfileState = { error?: string; success?: boolean };

async function submitProfile(
  _state: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  return updateCurrentUserProfile(formData);
}

export default function ProfileClient({
  profile,
}: {
  profile: {
    username?: string;
    email?: string;
    createdAt?: string;
    profileImageUrl?: string;
  };
}) {
  const [state, action, pending] = useActionState(submitProfile, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto size-28 overflow-hidden rounded-xl bg-slate-100">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt={profile.username || "Profile"}
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-primary">
              {(profile.username || "U").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-950">
          {profile.username}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
        <p className="mt-4 text-xs text-slate-400">
          Member since{" "}
          {profile.createdAt
            ? new Intl.DateTimeFormat("en-GB", {
                month: "long",
                year: "numeric",
              }).format(new Date(profile.createdAt))
            : "recently"}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Account details</h2>
        <form action={action} className="mt-5 max-w-xl space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Display name
            <input
              name="username"
              defaultValue={profile.username}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              value={profile.email || ""}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
            />
          </label>

          {state.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Profile updated.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Save size={17} />
            {pending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
