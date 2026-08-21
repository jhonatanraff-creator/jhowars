import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Work", description: "Projetos selecionados de Jhow.Ars." };

export default function WorkPage() {
  return (
    <div className="page-shell listing-page">
      <header className="page-intro">
        <p className="eyebrow">Arquivo de trabalhos</p>
        <h1>Arquivo<span>({String(projects.length).padStart(2, "0")})</span></h1>
        <p>Uma seleção de projetos autorais, séries, impressos e colaborações visuais.</p>
      </header>
      <div className="work-grid">
        {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
      </div>
    </div>
  );
}
