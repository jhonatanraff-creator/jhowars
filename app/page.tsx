import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { FeaturedProjects } from "@/components/featured-projects";
import { projects } from "@/data/projects";
import { getHomeCandidates, readProjectContent } from "@/lib/project-content";

export default async function Home() {
  noStore();
  const featured=projects.filter((project)=>project.featured);
  const items=await Promise.all(featured.map(async(project,index)=>{
    const [images,content]=await Promise.all([getHomeCandidates(project),readProjectContent(project)]);
    const image=images.length?images[Math.floor(Math.random()*images.length)]:undefined;
    return {project,image,summary:content.frontmatter.summary,number:index+1};
  }));
  return (
    <>
      <section className="home-opening page-shell" aria-labelledby="opening-title">
        <p className="eyebrow opening-label">Artista visual / Londrina — Brasil</p>
        <h1 id="opening-title"><span><i>Imagem, matéria</i></span><span><i>e impressão.</i></span></h1>
        <span className="opening-mark marker" aria-hidden="true">feito à mão</span>
      </section>

      <section className="featured page-shell" id="projetos">
        <div className="section-heading" data-reveal="stagger">
          <h2>Selected Work</h2>
          <span>2023—2026</span>
        </div>
        <FeaturedProjects items={items}/>
        <Link href="/work" className="text-link">Ver todos os projetos <span>↗</span></Link>
      </section>

      <div className="ticker" aria-label="Jhow Ars, artista visual, ilustração e impressão, Londrina Brasil">
        <p>JHOW.ARS — <em>ARTISTA VISUAL</em> — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA — BRASIL — JHOW.ARS — <em>ARTISTA VISUAL</em> — ILUSTRAÇÃO — IMPRESSÃO — LONDRINA — BRASIL —</p>
      </div>
      <section className="home-statement page-shell" data-reveal>
        <p className="eyebrow">Prática multidisciplinar</p>
        <h2>Desenho, cor e matéria como modos de fabular o cotidiano.</h2>
        <Link href="/about" className="text-link">Conheça a trajetória <span>↗</span></Link>
      </section>
    </>
  );
}
