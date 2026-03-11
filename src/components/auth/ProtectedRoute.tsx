"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!token || token === "undefined" || token === "null") {
      router.replace("/auth/login");
    }
  }, [token, router]);

  // Always render children to prevent hydration mismatch
  // Redirect happens asynchronously in useEffect
  return <>{children}</>;
} 