import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Sobre Jhow.Ars e sua prática artística." };

export default function AboutPage() {
  return (
    <div className="page-shell info-page">
      <header className="page-intro about-intro">
        <p className="eyebrow">Sobre</p>
        <h1>Jhow.Ars é artista visual, ilustrador e designer.</h1>
      </header>
      <div className="about-grid">
        <div className="portrait-placeholder" role="img" aria-label="Espaço reservado para retrato de Jhow.Ars">
          <span>Retrato<br />do artista</span><i />
        </div>
        <div className="about-copy">
          <p>Seu trabalho atravessa pintura, desenho, gravura, objetos e projetos gráficos. Investiga fabulações do cotidiano, memória, corpo e paisagem por meio de uma linguagem marcada pela cor e pelo gesto.</p>
          <p>Entre projetos autorais e colaborações, cria imagens para exposições, publicações, identidades e outras superfícies possíveis.</p>
          <div className="about-details">
            <div><span>Atuação</span><p>Arte visual<br />Ilustração<br />Design gráfico</p></div>
            <div><span>Base</span><p>Brasil<br />Disponível para<br />colaborações</p></div>
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
