import type { SiteSettings } from "@/lib/portfolio";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const email = settings?.email || "jhow@jhowars.com";
  const artistName = settings?.artistName || "Jhow.ars";
  return <footer className="site-footer">
    <div className="footer-contact">
      <p><span>Email: <a href={`mailto:${email}`}>{email}</a></span><span>Based in: Brasil</span></p>
      <p>Disponível para: colaborações, parcerias e projetos com identidade autoral</p>
    </div>
    <small>© {new Date().getFullYear()} {artistName}. All rights reserved</small>
  </footer>;
}
