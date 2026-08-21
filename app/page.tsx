import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <section className="home-opening page-shell">
        <div className="opening-index">01 — 06</div>
        <h1>ARTE VISUAL<br /><span>ILUSTRAÇÃO</span> <i>+</i><br />IMPRESSÃO</h1>
        <div className="opening-note">
          <span>Portfólio selecionado</span>
          <span>Londrina, Paraná<br />Brasil</span>
        </div>
      </section>

      <section className="selected-work page-shell" id="projetos">
        <div className="work-heading">
          <h2>Selected work</h2>
          <span>2023—2026</span>
          <p>Projetos autorais,<br />séries e impressos</p>
        </div>
        <div className="editorial-grid">
          {projects.filter((project) => project.featured).map((project, index, featured) => <ProjectCard key={project.slug} project={project} index={index} total={featured.length} />)}
        </div>
        <Link href="/work" className="index-link"><span>Arquivo completo</span><strong>Todos os projetos</strong><i>↗</i></Link>
      </section>

      <Marquee />
      <Reveal className="home-note page-shell">
        <p>Uma prática entre matéria, memória, desenho e circulação gráfica.</p>
        <Link href="/about">Sobre Jhow.Ars <span>↗</span></Link>
      </Reveal>
    </>
  );
}
