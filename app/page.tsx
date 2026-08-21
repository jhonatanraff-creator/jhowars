import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <section className="home-hero page-shell">
        <p className="eyebrow">Artista visual · Ilustrador · Designer</p>
        <h1>Imagens que habitam o intervalo entre <em>memória</em> e matéria.</h1>
        <div className="hero-bottom">
          <p>Jhow.Ars desenvolve trabalhos em pintura, desenho, impressão e design, articulando narrativas visuais entre o cotidiano e o fantástico.</p>
          <a href="#projetos" className="circle-link" aria-label="Ir para projetos">↓</a>
        </div>
      </section>

      <section className="featured page-shell" id="projetos">
        <div className="section-heading">
          <p className="eyebrow">Projetos selecionados</p>
          <span>2022—2025</span>
        </div>
        <div className="featured-grid">
          {projects.slice(0, 4).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} large={index === 0 || index === 3} />)}
        </div>
        <Link href="/work" className="text-link">Ver todos os projetos <span>↗</span></Link>
      </section>

      <section className="home-statement page-shell">
        <p>Prática multidisciplinar</p>
        <h2>Do traço ao objeto,<br />cada trabalho é um modo<br />de fabular o mundo.</h2>
        <Link href="/about" className="text-link">Sobre o artista <span>↗</span></Link>
      </section>
    </>
  );
}
