import type { Project } from "@/data/projects";

export function ProjectMeta({ project, index, total, inverted = false }: { project: Project; index: number; total: number; inverted?: boolean }) {
  return (
    <div className={`project-meta ${inverted ? "is-inverted" : ""}`}>
      <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      <span>{project.year}</span>
      <span>{project.category}</span>
    </div>
  );
}
