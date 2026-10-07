"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/portfolio";
import { copy, type Locale } from "@/lib/i18n";

export function Footer({ settings, settingsByLocale }: { settings: SiteSettings | null; settingsByLocale?: Record<Locale, SiteSettings | null> }) {
  const pathname = usePathname() || "/";
  const activeLocale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
  const activeSettings = settingsByLocale?.[activeLocale] ?? settings;
  const email = activeSettings?.email || "jhow@jhowars.com";
  const artistName = activeSettings?.artistName || "Jhow.ars";
  const labels = copy[activeLocale];
  const location = activeSettings?.locationLabel || (activeLocale === "en" ? "Brazil" : "Brasil");
  const availability = activeSettings?.footerAvailability || labels.footerAvailability;
  return <footer className="site-footer">
    <div className="footer-contact">
      <p><span>Email: <a href={`mailto:${email}`}>{email}</a></span><span>{labels.basedIn}: {location}</span></p>
      <p>{availability}</p>
    </div>
    <small>© {new Date().getFullYear()} {artistName}. All rights reserved</small>
  </footer>;
}
