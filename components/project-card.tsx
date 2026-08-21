import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { ProjectMeta } from "@/components/project-meta";
import { Reveal } from "@/components/reveal";

export function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  return (
    <Reveal className={`project-preview layout-${project.layout ?? "offset"}`} delay={(index % 3) * 60}>
      <article>
        <Link href={`/work/${project.slug}`} aria-label={`Ver projeto ${project.title}`} className="project-preview-link">
          <div className={`project-preview-image orientation-${project.orientation ?? "landscape"} tone-${project.tone}`}>
            <Image src={project.cover} alt={`Obra da série ${project.title}`} fill sizes="(max-width: 720px) 100vw, 75vw" />
            <span className="project-hover-label">Ver projeto <b>↗</b></span>
          </div>
          <div className="project-preview-copy">
            <ProjectMeta project={project} index={index} total={total} />
            <h2>{project.title}</h2>
            <span className="project-technique">{project.technique}</span>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}
