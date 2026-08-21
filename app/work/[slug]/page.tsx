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

  return (
    <article className="project-page">
      <header className="project-hero page-shell">
        <Link href="/work" className="back-link">← Todos os projetos</Link>
        <p className="eyebrow">{project.category}</p>
        <h1>{project.title}</h1>
        <dl>
          <div><dt>Ano</dt><dd>{project.year}</dd></div>
          <div><dt>Técnica</dt><dd>{project.technique}</dd></div>
        </dl>
      </header>
      <div className={`project-cover tone-${project.tone}`}>
        <Image src={project.cover} alt={`Capa do projeto ${project.title}`} fill priority sizes="100vw" />
      </div>
      <section className="project-description page-shell">
        <p className="eyebrow">Sobre o projeto</p>
        <p>{project.description}</p>
      </section>
      <section className="gallery page-shell" aria-label={`Galeria de ${project.title}`}>
        {project.images.slice(1).map((image, index) => (
          <figure key={image} className={`gallery-item gallery-${index + 1} tone-${project.tone}`}>
            <Image src={image} alt={`${project.title}, detalhe ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 70vw" />
            <figcaption>{String(index + 1).padStart(2, "0")} / {String(project.images.length - 1).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </section>
      <Link href={`/work/${next.slug}`} className={`next-project tone-${next.tone}`}>
        <span>Próximo projeto</span><strong>{next.title}</strong><span className="next-arrow">↗</span>
      </Link>
    </article>
  );
}
