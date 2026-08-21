import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export function ProjectCard({ project, index, large = false }: { project: Project; index: number; large?: boolean }) {
  return (
    <article className={`project-card tone-${project.tone} ${large ? "large" : ""}`}>
      <Link href={`/work/${project.slug}`} aria-label={`Ver projeto ${project.title}`}>
        <div className="project-image">
          <Image src={project.cover} alt={`Obra da série ${project.title}`} fill sizes={large ? "(max-width: 768px) 100vw, 65vw" : "(max-width: 768px) 100vw, 50vw"} />
          <span className="view-project">Ver projeto ↗</span>
        </div>
        <div className="project-caption">
          <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
          <h2>{project.title}</h2>
          <p>{project.category}</p>
          <p>{project.year}</p>
        </div>
      </Link>
    </article>
  );
}
