const copy = "JHOW.ARS — ARTISTA VISUAL — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA BRASIL — ";

export function Marquee() {
  return (
    <div className="marquee" aria-label={copy}>
      <div className="marquee-track" aria-hidden="true">
        <span>{copy}</span><span>{copy}</span><span>{copy}</span>
      </div>
    </div>
  );
}
