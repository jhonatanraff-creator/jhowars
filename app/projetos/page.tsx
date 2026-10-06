import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">Arquivo</p><h1>Projetos</h1></header>
    <section className="projects-grid" aria-label="Projetos">
      {projects.map((project, index) => <Link key={project._id} href={`/projetos/${project.slug}`} className={`project-tile tile-${index % 4}`}>
        <div className="tile-image"><Image src={project.cover} alt={project.title} fill sizes="(max-width: 700px) 90vw, 45vw" /></div>
        <div className="tile-caption"><h2>{project.title}</h2>{project.year && <span>{project.year}</span>}</div>
      </Link>)}
    </section>
  </div>;
}
