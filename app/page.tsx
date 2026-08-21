import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <section className="home-opening page-shell" aria-labelledby="opening-title">
        <p className="eyebrow">Artista visual / Londrina — Brasil</p>
        <h1 id="opening-title">Imagem, matéria<br />e impressão.</h1>
        <span className="opening-mark" aria-hidden="true">●</span>
      </section>

      <section className="featured page-shell" id="projetos">
        <div className="section-heading">
          <h2>Selected Work</h2>
          <span>2023—2026</span>
        </div>
        <div className="featured-grid">
          {projects.filter((project) => project.featured).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        </div>
        <Link href="/work" className="text-link">Ver todos os projetos <span>↗</span></Link>
      </section>

      <div className="ticker" aria-label="Jhow Ars, artista visual, ilustração e impressão, Londrina Brasil">
        <p>JHOW\.ARS — ARTISTA VISUAL — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA BRASIL —</p>
      </div>
      <section className="home-statement page-shell" data-reveal>
        <p className="eyebrow">Prática multidisciplinar</p>
        <h2>Desenho, cor e matéria como modos de fabular o cotidiano.</h2>
        <Link href="/about" className="text-link">Conheça a trajetória <span>↗</span></Link>
      </section>
    </>
  );
}
