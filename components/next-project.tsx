import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

export function NextProject({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="next-project">
      <span className="next-kicker">Next project</span>
      <strong>{project.title}</strong>
      <div className={`next-thumb tone-${project.tone}`}>
        <Image src={project.cover} alt="" fill sizes="220px" />
      </div>
      <span className="next-arrow">↗</span>
    </Link>
  );
}
