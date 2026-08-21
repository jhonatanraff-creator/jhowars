"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePreferences } from "@/components/preferences";

const links = [
  { href: "/work", label: "work" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
];

export function Header() {
  const {locale,theme,setLocale,setTheme,t}=usePreferences();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${compact ? " compact" : ""}`}>
      <Link href="/" className="wordmark" aria-label="Jhow.Ars — início" onClick={() => setOpen(false)}>
        {!logoUnavailable && <Image src="/brand/logo-jhowars.svg" alt="Jhow.Ars" width={142} height={40} priority onError={() => setLogoUnavailable(true)} />}
        {logoUnavailable && <span className="logo-fallback">JHOW<span>.</span>ARS</span>}
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Fechar menu" : "Abrir menu"}>
        <span>{open ? "Fechar" : "Menu"}</span>
        <i aria-hidden="true" />
      </button>
      <nav id="site-nav" className={open ? "nav open" : "nav"} aria-label="Navegação principal">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname.startsWith(link.href) ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {t(link.label as "work"|"about"|"contact")}
          </Link>
        ))}
        <div className="header-controls">
          <button type="button" onClick={()=>setLocale(locale==="pt"?"en":"pt")} aria-label="Change language"><b>{locale.toUpperCase()}</b> / {locale==="pt"?"EN":"PT"}</button>
          <button type="button" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label="Change color theme"><b>{theme.toUpperCase()}</b> / {theme==="light"?"DARK":"LIGHT"}</button>
        </div>
      </nav>
    </header>
  );
}
