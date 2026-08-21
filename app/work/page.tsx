import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { UiText } from "@/components/ui-preferences";
import { getProjectImages, getProjects, logProjectDiagnostics, selectProjectImage } from "@/lib/project-content";

export const metadata: Metadata = { title: "Work", description: "Projetos selecionados de Jhow.Ars." };

export default async function WorkPage() {
  const projects=await getProjects();
  const imagesByProject=await Promise.all(projects.map(getProjectImages));
  logProjectDiagnostics("WORK",projects,imagesByProject);
  const items=projects.map((project,index)=>({project,selectedImage:selectProjectImage(project,imagesByProject[index])}));
  return (
    <div className="page-shell listing-page">
      <header className="page-intro">
        <p className="eyebrow"><UiText id="archive"/></p>
        <h1>Arquivo<span>({String(projects.length).padStart(2, "0")})</span></h1>
        <p><UiText id="archiveDescription"/></p>
      </header>
      <div className="work-grid">
        {items.map(({project,selectedImage},index)=><ProjectCard key={project.slug} project={project} index={index} image={selectedImage}/>)}
      </div>
    </div>
  );
}
