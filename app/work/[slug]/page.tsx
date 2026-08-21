import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextProject, getProject, projects } from "@/data/projects";
import { ArtworkMedia } from "@/components/artwork-media";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = getNextProject(project.slug);
  const number = projects.findIndex(({ slug }) => slug === project.slug) + 1;

  return (
    <article className="project-page">
      <header className="project-hero page-shell" data-reveal="stagger">
        <Link href="/work" className="back-link">← Todos os projetos</Link>
        <p className="project-index">{String(number).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} <span>{project.year}</span></p>
        <h1>{project.title}</h1>
        <div className="project-tags"><span>{project.category}</span><span>{project.technique}</span><span>Brasil</span></div>
      </header>
      <div className={`project-cover tone-${project.tone}`} data-reveal="image-up" data-parallax>
        <ArtworkMedia src={project.cover} project={project.title} position="Cover" orientation={project.orientation} alt={`Capa do projeto ${project.title}`} priority sizes="100vw" />
      </div>
      <section className="project-description page-shell" data-reveal>
        <p className="eyebrow">Sobre o projeto</p>
        <p>{project.description}</p>
      </section>
      <section className="gallery page-shell" aria-label={`Galeria de ${project.title}`}>
        {project.images.map((image, index) => (
          <figure key={`${image.src}-${index}`} className={`gallery-item gallery-${index + 1} gallery-${image.orientation} tone-${project.tone}`} data-reveal={index % 2 ? "image-left" : "image-up"}>
            <ArtworkMedia src={image.src} project={project.title} position={String(index + 1).padStart(2, "0")} orientation={image.orientation} alt={`${project.title}, imagem ${index + 1}`} sizes="(max-width: 768px) 100vw, 70vw" />
            <figcaption>{String(index + 1).padStart(2, "0")} / {String(project.images.length).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </section>
      <section className="process page-shell" data-reveal>
        <p className="eyebrow">Processo</p>
        <p>Pesquisa, desenho e experimentação material. Cada etapa preserva os acidentes, as marcas da mão e as decisões que deram forma ao trabalho.</p>
      </section>
      <Link href={`/work/${next.slug}`} className="next-project" data-cursor-project data-reveal="clip-left">
        <span>Next project · {String((number % projects.length) + 1).padStart(2, "0")}</span><strong>{next.title}</strong><span className="next-arrow">↗</span>
      </Link>
    </article>
  );
}
