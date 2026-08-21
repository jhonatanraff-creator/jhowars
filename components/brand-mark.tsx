import Link from "next/link";

export function BrandMark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="brand-mark" aria-label="Jhow.Ars — início" onClick={onClick}>
      <span className="brand-name">JHOW<span className="brand-dot">.</span>ARS</span>
      <span className="brand-symbol" aria-hidden="true">J/A</span>
    </Link>
  );
}
