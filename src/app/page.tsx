// export const dynamic = "force-dynamic";

// import { redirect } from "next/navigation";

// export default function Home() {
//   // redirect("/main/dashboard");
//   redirect("/auth/login");

//   return null; // This line will never be reached, but satisfies TypeScript
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { getCurrentUser } from "@/store/slices/authSlice";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const validateToken = async () => {
      if (token && token !== "undefined" && token !== "null") {
        try {
          // Try to get current user to validate token
          const resultAction = await dispatch(getCurrentUser());
          if (getCurrentUser.fulfilled.match(resultAction)) {
            // Token is valid, redirect to dashboard
            router.replace("/main/dashboard");
          } else {
            // Token is invalid or expired
            router.replace("/auth/login");
          }
        } catch (error) {
          // Error occurred during validation
          router.replace("/auth/login");
        }
      } else {
        // No token, redirect to login
        router.replace("/auth/login");
      }
    };

    validateToken();
  }, [token, router, dispatch]);

  // Return null or a loading state while checking
  return null;
}
