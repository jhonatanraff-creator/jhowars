"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUiPreferences } from "@/components/ui-preferences";

const links = [
  { href: "/work", label: "work" as const },
  { href: "/about", label: "about" as const },
  { href: "/contact", label: "contact" as const },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const {locale,theme,setLocale,toggleTheme,t}=useUiPreferences();

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
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav" aria-label={open ? t("close") : t("menu")}>
        <span>{open ? t("close") : t("menu")}</span>
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
            {t(link.label)}
          </Link>
        ))}
        <div className="header-controls">
          <div className="language-control" aria-label="Idioma / Language">
            <button type="button" className={locale==="pt"?"active":""} onClick={()=>setLocale("pt")}>PT</button><span>/</span><button type="button" className={locale==="en"?"active":""} onClick={()=>setLocale("en")}>EN</button>
          </div>
          <button type="button" className="theme-control" onClick={toggleTheme} aria-label={theme==="light"?"Ativar tema escuro":"Use light theme"}>{theme==="light"?t("dark"):t("light")}</button>
        </div>
      </nav>
    </header>
  );
}
