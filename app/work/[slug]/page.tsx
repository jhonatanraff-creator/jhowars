import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextProject, getProject, projects } from "@/data/projects";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.description, openGraph: { images: [project.cover] } };
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
        <Image src={project.cover} alt={`Capa do projeto ${project.title}`} fill priority sizes="100vw" />
      </div>
      <section className="project-description page-shell" data-reveal>
        <p className="eyebrow">Sobre o projeto</p>
        <p>{project.description}</p>
      </section>
      <section className="gallery page-shell" aria-label={`Galeria de ${project.title}`}>
        {project.images.slice(1).map((image, index) => (
          <figure key={image} className={`gallery-item gallery-${index + 1} tone-${project.tone}`} data-reveal={index % 2 ? "image-left" : "image-up"} data-parallax={index === 0 ? "" : undefined}>
            <Image src={image} alt={`${project.title}, detalhe ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 70vw" />
            <figcaption>{String(index + 1).padStart(2, "0")} / {String(project.images.length - 1).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </section>
      <section className="process page-shell" data-reveal>
        <p className="eyebrow">Processo</p>
        <p>Pesquisa, desenho e experimentação material. Cada etapa preserva os acidentes, as marcas da mão e as decisões que deram forma ao trabalho.</p>
      </section>
      <Link href={`/work/${next.slug}`} className={`next-project tone-${next.tone}`} data-cursor-project data-reveal="clip-left">
        <span>Next project</span><strong>{next.title}</strong><span className="next-arrow">→</span>
      </Link>
    </article>
  );
}
