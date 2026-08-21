import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Sobre Jhow.Ars e sua prática artística." };

export default function AboutPage() {
  return (
    <div className="page-shell about-page">
      <header className="about-head">
        <span>About / Perfil</span>
        <h1>ARTISTA VISUAL,<br />ILUSTRADOR <i>+</i><br />DESIGNER.</h1>
        <p>Londrina — Paraná<br />Brasil</p>
      </header>
      <section className="about-grid">
        <div className="portrait-placeholder" role="img" aria-label="Espaço reservado para retrato de Jhow.Ars">
          <span>Foto / retrato<br />a inserir</span><i />
        </div>
        <div className="about-copy">
          <p>Jhow.Ars desenvolve uma prática atravessada por pintura, desenho, gravura, objetos e projetos gráficos.</p>
          <p className="about-secondary">Investiga fabulações do cotidiano, memória, corpo e paisagem por meio da cor, da matéria e do gesto. Entre trabalhos autorais e colaborações, cria imagens para exposições, publicações e outras superfícies possíveis.</p>
        </div>
      </section>
      <section className="about-register">
        <div><span>Trajetória</span><p>Prática independente entre arte visual, ilustração e design gráfico. Pesquisa contínua em impressão artesanal e publicação.</p></div>
        <div><span>Circulação</span><p>Feiras gráficas<br />Exposições coletivas<br />Publicações independentes<br />Colaborações</p></div>
        <div><span>Localização</span><p>Londrina, Paraná<br />Brasil<br /><br />Disponível para projetos e exposições.</p></div>
      </section>
      <nav className="about-links" aria-label="Links externos">
        <a href="https://instagram.com/jhowars" target="_blank" rel="noreferrer"><span>Instagram</span><b>@jhowars</b><i>↗</i></a>
        <a href="https://behance.net/jhowars" target="_blank" rel="noreferrer"><span>Behance</span><b>/jhowars</b><i>↗</i></a>
      </nav>
    </div>
  );
}
