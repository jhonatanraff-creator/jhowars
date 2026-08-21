import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkMedia } from "@/components/artwork-media";
import { getNextProject, getProject, getProjectImages, getProjects, readProjectContent, type ContentSection } from "@/lib/project-content";

export async function generateStaticParams(){return (await getProjects()).map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const project=await getProject((await params).slug); if(!project)return{};
  const content=await readProjectContent(project);
  return {title:content.frontmatter.title,description:content.frontmatter.summary};
}

function EditorialText({section}:{section:ContentSection}){
  if(!section.paragraphs.length)return null;
  return <section className={`editorial-text editorial-${section.kind} page-shell`} data-reveal>
    <p className="eyebrow">{section.kind==="intro"?"Sobre o projeto":section.kind==="closing"?"Closing":section.title}</p>
    <div>{section.kind==="section"&&<h2>{section.title}</h2>}{section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
  </section>;
}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const project=await getProject((await params).slug); if(!project)notFound();
  const projects=await getProjects();
  const [content,images]=await Promise.all([readProjectContent(project),getProjectImages(project)]);
  const next=await getNextProject(project.slug),number=projects.findIndex(({slug})=>slug===project.slug)+1;
  const hero=images[0]; const gallery=images.slice(1); const sections=content.sections;
  const imageGroups=sections.length?sections.map((_,index)=>gallery.filter((__,imageIndex)=>imageIndex%sections.length===index)):[];
  return <article className="project-page">
    <header className="project-hero page-shell" data-reveal="stagger">
      <Link href="/work" className="back-link">← Todos os projetos</Link>
      <p className="project-index">{String(number).padStart(2,"0")} / {String(projects.length).padStart(2,"0")} <span>{content.frontmatter.year}</span></p>
      <h1>{content.frontmatter.title}</h1>
      <div className="project-tags"><span>{content.frontmatter.category}</span><span>{project.technique}</span><span>Brasil</span></div>
    </header>
    <div className={`project-cover tone-${project.tone}`} data-reveal="image-up">
      <ArtworkMedia src={hero?.src} project={project.title} position="Cover" orientation={hero?.orientation??project.orientation} alt={`Capa do projeto ${project.title}`} priority sizes="100vw"/>
    </div>
    {sections.map((section,sectionIndex)=><div className="editorial-block" key={`${section.title}-${sectionIndex}`}>
      <EditorialText section={section}/>
      {imageGroups[sectionIndex]?.length>0&&<section className="gallery page-shell" aria-label={`Galeria de ${project.title}`}>
        {imageGroups[sectionIndex].map((image,index)=><figure key={image.src} className={`gallery-item gallery-${image.orientation} tone-${project.tone}`} data-reveal={index%2?"image-left":"image-up"}>
          <ArtworkMedia src={image.src} project={project.title} position={String(index+2).padStart(2,"0")} orientation={image.orientation} alt={`${project.title}, imagem ${index+2}`} sizes="(max-width: 768px) 100vw, 70vw"/>
          <figcaption>{String(index+2).padStart(2,"0")} / {String(images.length).padStart(2,"0")}</figcaption>
        </figure>)}
      </section>}
    </div>)}
    {next&&<Link href={`/work/${next.slug}`} className="next-project" data-cursor-project data-reveal="clip-left"><span>Next project · {String((number%projects.length)+1).padStart(2,"0")}</span><strong>{next.title}</strong><span className="next-arrow">↗</span></Link>}
  </article>;
}
