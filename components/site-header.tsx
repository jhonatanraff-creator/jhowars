"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/portfolio";
import { JhowIsotype } from "@/components/brand/JhowIsotype";
import { counterpartPath, copy, type Locale } from "@/lib/i18n";

function SocialIcon({ kind }: { kind: "instagram" | "behance" | "linkedin" | "email" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (kind === "instagram") return <svg {...common}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.7" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>;
  if (kind === "behance") return <svg {...common} stroke="none" fill="currentColor"><path d="M3 5h7.2c3.2 0 4.8 1.6 4.8 4a3.4 3.4 0 0 1-2.1 3.2c1.8.5 2.8 1.8 2.8 3.7 0 2.6-1.9 4.1-5.1 4.1H3V5Zm3.2 2.7v3.4h3.5c1.3 0 2-.6 2-1.7s-.7-1.7-2-1.7H6.2Zm0 5.8v3.8h4c1.4 0 2.2-.7 2.2-1.9s-.8-1.9-2.2-1.9h-4ZM17 7h5v1.8h-5V7Zm2.6 3c2.9 0 4.5 2 4.5 5v.7h-7.2c.1 1.5 1 2.3 2.5 2.3 1.1 0 1.8-.4 2.1-1.2h2.4c-.5 2.1-2.2 3.3-4.7 3.3-3.2 0-5-1.9-5-5s2-5.1 5.4-5.1Zm-2.7 3.8h4.6c-.1-1.2-.9-1.9-2.1-1.9-1.3 0-2.2.7-2.5 1.9Z"/></svg>;
  if (kind === "linkedin") return <svg {...common} stroke="none" fill="currentColor"><path d="M5.3 8.4A2.1 2.1 0 1 0 5.3 4a2.1 2.1 0 0 0 0 4.3ZM3.5 10h3.6v10H3.5V10Zm5.8 0h3.4v1.4h.1a3.8 3.8 0 0 1 3.4-1.8c3.6 0 4.3 2.3 4.3 5.2V20h-3.6v-4.6c0-1.1 0-2.6-1.7-2.6s-2 1.2-2 2.5V20H9.3V10Z"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>;
}

export function SiteHeader({ settings, settingsByLocale }: { settings: SiteSettings | null; settingsByLocale?: Record<Locale, SiteSettings | null> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const activeLocale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
  const projectsActive = pathname === "/projetos" || pathname.startsWith("/projetos/") || pathname === "/en/projects" || pathname.startsWith("/en/projects/");
  const aboutActive = pathname === "/sobre" || pathname === "/en/about";
  const shopActive = pathname === "/shop" || pathname === "/en/shop";
  const hasActivePage = projectsActive || aboutActive || shopActive;
  const labels = copy[activeLocale];
  const activeSettings = settingsByLocale?.[activeLocale] ?? settings;
  const prefix = activeLocale === "en" ? "/en" : "";
  const socials = [
    { key: "instagram" as const, label: "Instagram", href: activeSettings?.instagram },
    { key: "behance" as const, label: "Behance", href: activeSettings?.behance },
    { key: "linkedin" as const, label: "LinkedIn", href: activeSettings?.linkedin },
    { key: "email" as const, label: "E-mail", href: activeSettings?.email ? `mailto:${activeSettings.email}` : undefined },
  ];
  const languageSwitch = <div className="language-switch" aria-label="Language / Idioma">
    <Link href={counterpartPath(pathname, "pt")} aria-current={activeLocale === "pt" ? "page" : undefined} className={activeLocale === "pt" ? "is-active" : ""}>PT</Link><span>/</span><Link href={counterpartPath(pathname, "en")} aria-current={activeLocale === "en" ? "page" : undefined} className={activeLocale === "en" ? "is-active" : ""}>EN</Link>
  </div>;
  return <header className="site-header">
    <nav className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label={labels.navigation} id="site-navigation" data-has-active={hasActivePage}>
      <div className="primary-links">
        <Link href={`${prefix}/projetos`.replace("/en/projetos", "/en/projects")} aria-current={projectsActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{labels.projects}</Link>
        <Link href={activeLocale === "en" ? "/en/about" : "/sobre"} aria-current={aboutActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{labels.about}</Link>
        {activeSettings?.shopEnabled === true && <Link href={`${prefix}/shop`} aria-current={shopActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{labels.shop}</Link>}
        {activeSettings?.email && <a href={`mailto:${activeSettings.email}`} onClick={() => setMenuOpen(false)}>{labels.contact}</a>}
      </div>
      <div className="mobile-header-tools">{languageSwitch}<div className="social-links" aria-label="Redes e contato">{socials.map(({ key, label, href }) => href ? <a key={key} href={href} aria-label={label} title={label}><SocialIcon kind={key} /></a> : null)}</div></div>
    </nav>
    <Link className="brand jhow-isotype-link" href={activeLocale === "en" ? "/en" : "/"} aria-label={labels.home}><JhowIsotype /></Link>
    <div className="header-actions">{languageSwitch}<div className="social-links" aria-label="Redes e contato">{socials.map(({ key, label, href }) => href ? <a key={key} href={href} aria-label={label} title={label}><SocialIcon kind={key} /></a> : null)}</div></div>
    <button className={`menu-toggle${menuOpen ? " is-open" : ""}`} aria-label={menuOpen ? labels.menuClose : labels.menuOpen} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
  </header>;
}
