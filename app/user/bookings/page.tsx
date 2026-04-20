import { getBookingsForUser } from "@/app/actions/bookings";
import UserBookingsClient from "@/app/components/user/UserBookingsClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserBookingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const bookings = await getBookingsForUser(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">My bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your requests, confirmed trips, and travel history.
        </p>
      </div>

      <UserBookingsClient bookings={bookings} />
    </div>
  );
}
