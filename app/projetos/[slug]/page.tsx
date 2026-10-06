import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/portfolio";
import { ProjectContentBlocks } from "@/components/project-content-blocks";

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return project ? { title: project.title, description: project.summary || project.descriptionPt || project.descriptionEn } : {};
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const blocks = project.contentBlocks ?? [];
  const gallery = project.artworks?.filter((artwork) => artwork.image && artwork.image !== project.cover) ?? [];
  const description = project.summary || project.descriptionPt || project.descriptionEn;
  return <article className="detail-page page-shell">
    <Link className="back-link" href="/projetos">← Projetos</Link>
    <header className="detail-heading"><p className="eyebrow">{project.category ?? "Projeto"}{project.year ? ` · ${project.year}` : ""}</p><h1>{project.title}</h1></header>
    {project.cover && <figure className="detail-cover"><Image src={project.cover} alt={project.title} fill sizes="96vw" priority /></figure>}
    {blocks.length > 0 ? <ProjectContentBlocks blocks={blocks} /> : <>
      {gallery.length > 0 && <section className="detail-gallery" aria-label={`Mais imagens de ${project.title}`}>
        {gallery.map((artwork) => <figure key={artwork._id}><Image src={artwork.image} alt={artwork.alt || artwork.title} fill sizes="(max-width: 700px) 90vw, 44vw" /><figcaption>{artwork.title}</figcaption></figure>)}
      </section>}
      {description && <section className="detail-copy"><div>{description.split("\n\n").map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div></section>}
    </>}
  </article>;
}
