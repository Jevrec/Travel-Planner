import { getCurrentUserProfile } from "@/app/actions/profile";
import ProfileClient from "@/app/components/user/ProfileClient";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your account details up to date.
        </p>
      </div>

      <ProfileClient profile={profile} />
    </div>
  );
}
