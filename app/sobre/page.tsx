import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre" };

const biography = [
  "Sou Jhow.ars, ilustrador e designer, um alter ego do Jhonatan Rafael. Este é um projeto autoral onde arte e design se encontram em experimentação constante, entre o manual e o digital, entre obras únicas e séries que se desdobram em diferentes formatos.",
  "O trabalho nasce da minha vivência, da observação do cotidiano e de um imaginário atravessado pelo Brasil, pela art naïf e pela exploração de formas, cores e narrativas visuais que surgem da vontade de criar e contar histórias por imagem.",
  "Parte desse processo acontece em diálogo com outros artistas, no Grafatório e no coletivo Mãos Sujas, em Londrina, onde a impressão artesanal, a troca e o fazer coletivo também alimentam e expandem esse universo em construção.",
];

export default function AboutPage() {
  return <article className="about-page page-shell"><p className="eyebrow">Jhow.ars · Visual artist & illustrator · Brazil</p><h1>Sobre</h1>
    <div className="about-copy">{biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    <nav className="about-links" aria-label="Contato e redes"><a href="mailto:jhow@jhowars.com">jhow@jhowars.com ↗</a><a href="https://www.instagram.com/jhow.ars/">Instagram ↗</a><a href="https://www.behance.net/Jhonatanraff">Behance ↗</a><a href="https://www.linkedin.com/in/jhonatanrafaelars">LinkedIn ↗</a></nav>
  </article>;
}
