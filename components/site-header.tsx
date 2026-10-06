import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="Jhow.ars — início">
      <Image src="/legacy/brand/wordmark-hover.png" alt="Jhow.ars — Visual Artist & Illustrator — Brazil" width={1425} height={563} priority />
    </Link>
    <nav aria-label="Navegação principal">
      <Link href="/projetos">Projetos</Link><Link href="/sobre">Sobre</Link><Link href="/shop">Shop</Link>
    </nav>
    <div className="social-links" aria-label="Redes e contato">
      <a href="https://www.instagram.com/jhow.ars/" aria-label="Instagram">◎</a>
      <a href="https://www.behance.net/Jhonatanraff" aria-label="Behance">Bē</a>
      <a href="https://www.linkedin.com/in/jhonatanrafaelars" aria-label="LinkedIn">in</a>
      <a href="mailto:jhow@jhowars.com" aria-label="Email">✉</a>
    </div>
  </header>;
}
