"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { SiteSettings } from "@/lib/portfolio";

function SocialIcon({ kind }: { kind: "instagram" | "behance" | "linkedin" | "email" }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (kind === "instagram") return <svg {...common}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.7" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>;
  if (kind === "behance") return <svg {...common} stroke="none" fill="currentColor"><path d="M3 5h7.2c3.2 0 4.8 1.6 4.8 4a3.4 3.4 0 0 1-2.1 3.2c1.8.5 2.8 1.8 2.8 3.7 0 2.6-1.9 4.1-5.1 4.1H3V5Zm3.2 2.7v3.4h3.5c1.3 0 2-.6 2-1.7s-.7-1.7-2-1.7H6.2Zm0 5.8v3.8h4c1.4 0 2.2-.7 2.2-1.9s-.8-1.9-2.2-1.9h-4ZM17 7h5v1.8h-5V7Zm2.6 3c2.9 0 4.5 2 4.5 5v.7h-7.2c.1 1.5 1 2.3 2.5 2.3 1.1 0 1.8-.4 2.1-1.2h2.4c-.5 2.1-2.2 3.3-4.7 3.3-3.2 0-5-1.9-5-5s2-5.1 5.4-5.1Zm-2.7 3.8h4.6c-.1-1.2-.9-1.9-2.1-1.9-1.3 0-2.2.7-2.5 1.9Z"/></svg>;
  if (kind === "linkedin") return <svg {...common} stroke="none" fill="currentColor"><path d="M5.3 8.4A2.1 2.1 0 1 0 5.3 4a2.1 2.1 0 0 0 0 4.3ZM3.5 10h3.6v10H3.5V10Zm5.8 0h3.4v1.4h.1a3.8 3.8 0 0 1 3.4-1.8c3.6 0 4.3 2.3 4.3 5.2V20h-3.6v-4.6c0-1.1 0-2.6-1.7-2.6s-2 1.2-2 2.5V20H9.3V10Z"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>;
}

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const [logoHovered, setLogoHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const socials = [
    { key: "instagram" as const, label: "Instagram", href: settings?.instagram },
    { key: "behance" as const, label: "Behance", href: settings?.behance },
    { key: "linkedin" as const, label: "LinkedIn", href: settings?.linkedin },
    { key: "email" as const, label: "E-mail", href: settings?.email ? `mailto:${settings.email}` : undefined },
  ];
  return <header className="site-header">
    <Link className="brand" href="/" aria-label={`${settings?.artistName || "Jhow.ars"} — início`} onMouseEnter={() => setLogoHovered(true)} onMouseLeave={() => setLogoHovered(false)} onFocus={() => setLogoHovered(true)} onBlur={() => setLogoHovered(false)}>
      <Image src={logoHovered ? "/legacy/brand/wordmark-hover.png" : "/legacy/brand/wordmark.gif"} alt={settings?.artistName || "Jhow.ars"} width={1425} height={563} unoptimized priority />
    </Link>
    <button className="menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "Fechar" : "Menu"}</button>
    <nav id="site-navigation" className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Navegação principal">
      <div className="primary-links"><Link href="/projetos" onClick={() => setMenuOpen(false)}>Projetos</Link><Link href="/sobre" onClick={() => setMenuOpen(false)}>Sobre</Link><Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></div>
      <div className="social-links" aria-label="Redes e contato">{socials.map(({ key, label, href }) => href ? <a key={key} href={href} aria-label={label} title={label}>{<SocialIcon kind={key} />}</a> : null)}</div>
    </nav>
  </header>;
}
