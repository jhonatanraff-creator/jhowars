"use client";

import type { MediaOrientation } from "@/data/projects";

type ArtworkMediaProps = {
  src?: string;
  project: string;
  position: string;
  orientation: MediaOrientation;
  alt: string;
  sizes: string;
  priority?: boolean;
};

export function ArtworkMedia({ src, project, position, orientation, alt, sizes, priority }: ArtworkMediaProps) {
  return (
    <div className={`artwork-media media-${orientation}${src?" has-image":" has-placeholder"}`}>
      {src ? (
        // The source files have many different proportions; the browser's intrinsic sizing must win.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority?"eager":"lazy"}
          fetchPriority={priority?"high":"auto"}
        />
      ) : (
        <div className="artwork-placeholder" role="img" aria-label={`${project}, imagem ${position}, ${orientation}`}>
          <span className="placeholder-label">Project image</span>
          <strong>{project}</strong>
          <span className="placeholder-index">{position}</span>
          <span className="placeholder-orientation">{orientation}</span>
        </div>
      )}
    </div>
  );
}
