"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AuthProtection({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is logged in, redirect away from auth pages
    if (token && token !== "undefined" && token !== "null") {
      router.replace("/main/dashboard");
    }
  }, [token, router]);

  // Only render children if user is not authenticated
  if (token && token !== "undefined" && token !== "null") {
    return null;
  }

  return <>{children}</>;
} 