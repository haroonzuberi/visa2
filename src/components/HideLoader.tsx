"use client";

import { useEffect } from "react";

/**
 * Hides the server-rendered #page-loader overlay after React hydration.
 * Uses CSS only (no DOM removal) to avoid React reconciliation errors
 * (insertBefore/removeChild NotFoundError) when the virtual DOM expects
 * the loader node to still exist.
 */
export default function HideLoader() {
  useEffect(() => {
    const loader = document.getElementById("page-loader");
    if (!loader) return;

    loader.classList.add("loader-fade-out");
  }, []);

  return null;
}
