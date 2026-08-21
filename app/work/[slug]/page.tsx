import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextProject, getProject, projects } from "@/data/projects";
import Image from "next/image";
import { ProjectGallery } from "@/components/project-gallery";
import { NextProject } from "@/components/next-project";
import { Reveal } from "@/components/reveal";

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
  const index = projects.findIndex(({ slug }) => slug === project.slug);

  return (
    <article className="project-page">
      <header className="project-hero page-shell">
        <div className="project-hero-top">
          <Link href="/work">← Work</Link>
          <span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>
        <h1>{project.title}</h1>
        <div className="project-hero-meta">
          <span>{project.category}</span>
          <span>{project.technique}</span>
          <span>Londrina — BR</span>
        </div>
      </header>
      <div className={`project-cover tone-${project.tone}`}>
        <Image src={project.cover} alt={`Capa do projeto ${project.title}`} fill priority sizes="100vw" />
      </div>
      <Reveal className="project-intro page-shell">
        <span>Sobre / {project.year}</span>
        <p>{project.description}</p>
        <dl><div><dt>Categoria</dt><dd>{project.category}</dd></div><div><dt>Técnica</dt><dd>{project.technique}</dd></div></dl>
      </Reveal>
      <ProjectGallery project={project} />
      <NextProject project={next} />
    </article>
  );
}
