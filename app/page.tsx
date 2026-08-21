import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { randomInt } from "node:crypto";
import { FeaturedProjects } from "@/components/featured-projects";
import { UiText } from "@/components/ui-preferences";
import { getProjectImages, getProjects, logProjectDiagnostics, publicImageExists, readProjectContent, selectProjectImage } from "@/lib/project-content";

export default async function Home() {
  noStore();
  const projects=await getProjects();
  const imagesByProject=await Promise.all(projects.map(getProjectImages));
  logProjectDiagnostics("HOME",projects,imagesByProject);
  const featured=projects.filter((project)=>project.featured);
  const items=await Promise.all(featured.map(async(project,index)=>{
    const projectImages=imagesByProject[projects.indexOf(project)]??[];
    const configuredCandidates=project.homeImages?.filter(publicImageExists)??[];
    const candidates=configuredCandidates.length?configuredCandidates:projectImages.map(({src})=>src);
    const selectedImage=candidates.length?candidates[randomInt(candidates.length)]:selectProjectImage(project,projectImages);
    const content=await readProjectContent(project);
    return {project,selectedImage,summary:content.frontmatter.summary,number:index+1};
  }));
  return (
    <>
      <section className="home-opening page-shell" aria-labelledby="opening-title">
        <p className="eyebrow opening-label"><UiText id="artistLocation"/></p>
        <h1 id="opening-title"><span><i><UiText id="heroLine1"/></i></span><span><i><UiText id="heroLine2"/></i></span></h1>
        <span className="opening-mark marker" aria-hidden="true">FEITO A MAO</span>
      </section>

      <section className="featured page-shell" id="projetos">
        <div className="section-heading" data-reveal="stagger">
          <h2><UiText id="selectedWork"/></h2>
          <span>2023—2026</span>
        </div>
        <FeaturedProjects items={items}/>
        <Link href="/work" className="text-link"><UiText id="viewAll"/> <span>↗</span></Link>
      </section>

      <div className="ticker" aria-label="Jhow Ars, artista visual, ilustração e impressão, Londrina Brasil">
        <p>JHOW.ARS — <em>ARTISTA VISUAL</em> — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA — BRASIL — JHOW.ARS — <em>ARTISTA VISUAL</em> — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA — BRASIL —</p>
      </div>
      <section className="home-statement page-shell" data-reveal>
        <p className="eyebrow"><UiText id="practice"/></p>
        <h2><UiText id="statement"/></h2>
        <Link href="/about" className="text-link"><UiText id="trajectory"/> <span>↗</span></Link>
      </section>
    </>
  );
}
