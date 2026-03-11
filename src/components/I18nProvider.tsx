"use client";

import { useEffect } from "react";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n only on client-side after component mounts
    if (typeof window !== "undefined") {
      import("../i18n").catch((err) => {
        console.error("Failed to load i18n:", err);
      });
    }
  }, []);

  return <>{children}</>;
}
