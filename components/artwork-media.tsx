"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [failedSource, setFailedSource] = useState<string>();
  const hasImage = Boolean(src && failedSource !== src);

  return (
    <div className={`artwork-media media-${orientation}`}>
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailedSource(src)}
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
