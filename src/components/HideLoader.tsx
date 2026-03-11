"use client";

import { useEffect } from "react";

/**
 * Removes the server-rendered #page-loader overlay after React hydration.
 * The loader div is always present in the initial HTML (no JS needed to show it),
 * so the user never sees a blank white screen, even on slow connections.
 */
export default function HideLoader() {
  useEffect(() => {
    const loader = document.getElementById("page-loader");
    if (!loader) return;

    // Fade out with CSS transition
    loader.classList.add("loader-fade-out");

    // Remove from DOM after transition completes
    const timer = setTimeout(() => {
      loader.remove();
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
