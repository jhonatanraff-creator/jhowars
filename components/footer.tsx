import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <p>JHOW.ARS®<br />Londrina — Brasil</p>
      <div>
        <a href="/work">Work</a>
        <a href="/about">About</a>
        <a href="https://instagram.com/jhowars" target="_blank" rel="noreferrer">Instagram ↗</a>
      </div>
      <p className="footer-credit">Artista visual, ilustrador<br />e designer independente.</p>
      <Link href="#top" aria-label="Voltar ao topo">Topo ↑</Link>
    </footer>
  );
}
