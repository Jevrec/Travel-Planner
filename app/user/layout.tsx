import UserShell from "@/app/components/user/UserShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.isAdmin) {
    redirect("/admin");
  }

  return <UserShell userName={session.user.name}>{children}</UserShell>;
}
