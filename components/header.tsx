"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${compact ? "is-compact" : ""} ${open ? "menu-open" : ""}`}>
      <BrandMark onClick={() => setOpen(false)} />
      <div className="header-place">Londrina — BR</div>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav">
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
      <span className="header-year">2026</span>
    </header>
  );
}
