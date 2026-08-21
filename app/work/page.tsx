import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { getProjectImages, getProjects, logProjectDiagnostics, selectProjectImage } from "@/lib/project-content";

export const metadata: Metadata = { title: "Work", description: "Projetos selecionados de Jhow.Ars." };

export default async function WorkPage() {
  const projects=await getProjects();
  const imagesByProject=await Promise.all(projects.map(getProjectImages));
  logProjectDiagnostics("WORK",projects,imagesByProject);
  const selectedImages=projects.map((project,index)=>selectProjectImage(project,imagesByProject[index]));
  return (
    <div className="page-shell listing-page">
      <header className="page-intro">
        <p className="eyebrow">Arquivo de trabalhos</p>
        <h1>Arquivo<span>({String(projects.length).padStart(2, "0")})</span></h1>
        <p>Uma seleção de projetos autorais, séries, impressos e colaborações visuais.</p>
      </header>
      <div className="work-grid">
        {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} image={selectedImages[index]} />)}
      </div>
    </div>
  );
}
