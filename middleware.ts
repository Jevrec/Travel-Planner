import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export default auth(async (req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Preveri admin flag na user dokumentu v Sanity
    const user = await client.fetch(
      `*[_type == "user" && _id == $id][0]{ isAdmin }`,
      { id: req.auth.user?.id },
    );

    if (!user?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
