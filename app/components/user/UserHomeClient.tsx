"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserHomeClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user");
  }, [router]);

  return null;
}
