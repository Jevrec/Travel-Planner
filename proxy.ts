import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export default auth(async (req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isUserRoute = req.nextUrl.pathname.startsWith("/user");

  if (isAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const sessionUser = req.auth.user as { id?: string; isAdmin?: boolean };

    if (sessionUser.isAdmin) {
      return NextResponse.next();
    }

    const user = await client.fetch(
      `*[_type == "user" && _id == $id][0]{ isAdmin }`,
      { id: sessionUser.id },
    );

    if (!user?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isUserRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const sessionUser = req.auth.user as { isAdmin?: boolean };

    if (sessionUser.isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*", "/user/:path*"] };
