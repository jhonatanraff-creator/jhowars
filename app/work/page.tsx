import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Work", description: "Projetos selecionados de Jhow.Ars." };

export default function WorkPage() {
  return (
    <div className="page-shell work-index-page">
      <header className="work-index-head">
        <span>Arquivo / {String(projects.length).padStart(2, "0")}</span>
        <h1>WORK</h1>
        <p>Projetos autorais, séries,<br />impressos e colaborações visuais.</p>
        <span>2022—2026</span>
      </header>
      <div className="editorial-grid work-index-grid">
        {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} total={projects.length} />)}
      </div>
    </div>
  );
}
