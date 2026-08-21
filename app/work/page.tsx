import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { getProjectImages, getProjects } from "@/lib/project-content";

export const metadata: Metadata = { title: "Work", description: "Projetos selecionados de Jhow.Ars." };

export default async function WorkPage() {
  const projects=await getProjects();
  const covers=await Promise.all(projects.map(async(project)=>(await getProjectImages(project))[0]?.src));
  return (
    <div className="page-shell listing-page">
      <header className="page-intro">
        <p className="eyebrow">Arquivo de trabalhos</p>
        <h1>Arquivo<span>({String(projects.length).padStart(2, "0")})</span></h1>
        <p>Uma seleção de projetos autorais, séries, impressos e colaborações visuais.</p>
      </header>
      <div className="work-grid">
        {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} image={covers[index]} />)}
      </div>
    </div>
  );
}
