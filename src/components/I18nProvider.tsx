"use client";

import type { ReactNode } from "react";
// Import i18n synchronously so it's initialized before any child calls useTranslation().
// Previously i18n was loaded in useEffect, so useTranslation() ran before init → changeLanguage was undefined.
import "../i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
