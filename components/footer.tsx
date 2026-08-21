import Link from "next/link";
import { UiText } from "@/components/ui-preferences";

export function Footer() {
  return (
    <footer className="footer">
      <p>Jhow.Ars © {new Date().getFullYear()}</p>
      <div>
        <a href="https://instagram.com/jhowars" target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href="mailto:oi@jhowars.com">E-mail ↗</a>
      </div>
      <Link href="#top" aria-label="Voltar ao topo">↑ <UiText id="backToTop"/></Link>
    </footer>
  );
}
