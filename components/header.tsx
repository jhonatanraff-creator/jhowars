"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
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
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
