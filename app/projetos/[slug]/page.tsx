import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtworks, getProjects } from "@/lib/portfolio";

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((entry) => entry.slug === slug);
  return project ? { title: project.title, description: project.descriptionEn ?? project.descriptionPt } : {};
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [projects, artworks] = await Promise.all([getProjects(), getArtworks()]);
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  const gallery = artworks.filter((artwork) => artwork.projectSlug === slug && artwork.image !== project.cover);
  return <article className="detail-page page-shell">
    <Link className="back-link" href="/projetos">← Projetos</Link>
    <header className="detail-heading"><p className="eyebrow">{project.category ?? "Projeto"}{project.year ? ` · ${project.year}` : ""}</p><h1>{project.title}</h1></header>
    <figure className="detail-cover"><Image src={project.cover} alt={project.title} fill sizes="96vw" priority /></figure>
    {gallery.length > 0 && <section className="detail-gallery" aria-label={`Mais imagens de ${project.title}`}>
      {gallery.map((artwork) => <figure key={artwork._id}><Image src={artwork.image} alt={artwork.alt} fill sizes="(max-width: 700px) 90vw, 44vw" /><figcaption>{project.title}</figcaption></figure>)}
    </section>}
    {(project.descriptionPt || project.descriptionEn) && <section className="detail-copy">
      {project.descriptionPt && <div><p className="eyebrow">Português</p>{project.descriptionPt.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
      {project.descriptionEn && <div><p className="eyebrow">English</p>{project.descriptionEn.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
    </section>}
  </article>;
}
