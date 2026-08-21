import Image from "next/image";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/reveal";

export function ProjectGallery({ project }: { project: Project }) {
  const details = project.images.slice(1);
  return (
    <section className={`project-gallery gallery-layout-${project.layout ?? "offset"}`} aria-label={`Galeria de ${project.title}`}>
      <div className="gallery-label page-shell"><span>Processo / detalhes</span><span>{String(details.length).padStart(2, "0")} imagens</span></div>
      <div className="gallery-composition page-shell">
        {details.map((image, index) => (
          <Reveal key={image} className={`gallery-frame gallery-frame-${index + 1}`} delay={index * 70}>
            <figure className={`tone-${project.tone}`}>
              <Image src={image} alt={`${project.title}, detalhe ${index + 1}`} fill sizes="(max-width: 720px) 100vw, 65vw" />
              <figcaption>{String(index + 1).padStart(2, "0")} — {project.technique}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
