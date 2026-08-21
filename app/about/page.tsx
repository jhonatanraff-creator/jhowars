import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Sobre Jhow.Ars e sua prática artística." };

export default function AboutPage() {
  return (
    <div className="page-shell info-page">
      <header className="page-intro about-intro">
        <p className="eyebrow">About / 2026</p>
        <h1>Jhow.Ars trabalha entre a imagem, o gesto e a matéria impressa.</h1>
      </header>
      <div className="about-grid">
        <div className="portrait-placeholder" role="img" aria-label="Espaço reservado para retrato de Jhow.Ars">
          <span>Espaço para<br />retrato do artista</span><i />
        </div>
        <div className="about-copy">
          <p>Artista visual, ilustrador e designer, desenvolve uma prática atravessada por pintura, desenho, gravura, objetos e projetos gráficos.</p>
          <p>Entre projetos autorais e colaborações, cria imagens para exposições, publicações, identidades e outras superfícies possíveis.</p>
          <div className="about-details">
            <div><span>Trajetória</span><p>Prática independente<br />Arte visual<br />Ilustração e impressão</p></div>
            <div><span>Circulação</span><p>Feiras gráficas<br />Publicações<br />Exposições coletivas</p></div>
            <div><span>Base</span><p>Londrina, Paraná<br />Brasil</p></div>
            <div><span>Contato</span><p>Projetos, exposições<br />e colaborações</p></div>
          </div>
          <div className="external-links">
            <a href="https://instagram.com/jhowars" target="_blank" rel="noreferrer">Instagram ↗</a>
            <a href="https://behance.net/jhowars" target="_blank" rel="noreferrer">Behance ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
