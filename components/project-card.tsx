import Link from "next/link";
import type { CSSProperties } from "react";
import { ArtworkMedia } from "@/components/artwork-media";
import type { Project } from "@/data/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project-card project-${project.layout} project-${project.orientation}`} data-reveal={index % 2 ? "image-left" : "image-up"} style={{ "--delay": `${(index % 3) * 70}ms` } as CSSProperties}>
      <Link href={`/work/${project.slug}`} aria-label={`Ver projeto ${project.title}`} data-cursor-project>
        <div className="project-image">
          <ArtworkMedia src={project.cover} project={project.title} position="Cover" orientation={project.orientation} alt={`Obra da série ${project.title}`} sizes="(max-width: 768px) 94vw, 68vw" />
          <span className="view-project">Ver projeto ↗</span>
        </div>
        <div className="project-caption">
          <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
          <h2>{project.title}</h2>
          <p>{project.technique}</p>
          <p>{project.year} · {project.category}</p>
        </div>
      </Link>
    </article>
  );
}
