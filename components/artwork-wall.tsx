"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioArtwork, PortfolioProject } from "@/data/portfolio";

const presets = ["wall-a", "wall-b", "wall-c", "wall-d", "wall-e", "wall-f", "wall-g", "wall-h", "wall-i", "wall-j"];

export function ArtworkWall({ artworks, projects }: { artworks: PortfolioArtwork[]; projects: PortfolioProject[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [count, setCount] = useState(artworks.length);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const visibleItems = useMemo(() => Array.from({ length: count }, (_, i) => artworks[i % artworks.length]), [artworks, count]);
  const selected = activeId === null ? null : artworks.find((artwork) => artwork._id === activeId);
  const activeIndex = selected ? artworks.findIndex((artwork) => artwork._id === selected._id) : 0;
  const selectedProject = selected ? projects.find((project) => project.slug === selected.projectSlug) : null;

  const close = useCallback(() => setActiveId(null), []);
  const step = useCallback((delta: number) => setActiveId((current) => {
    if (current === null) return null;
    const currentIndex = artworks.findIndex((artwork) => artwork._id === current);
    return artworks[(currentIndex + delta + artworks.length) % artworks.length]?._id ?? null;
  }), [artworks]);

  useEffect(() => {
    if (activeId === null) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[role=dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!focusable?.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", onKey); openerRef.current?.focus(); };
  }, [activeId, close, step]);

  useEffect(() => {
    const sentinel = document.querySelector("#wall-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setCount((current) => current + artworks.length); }, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [artworks.length]);

  return <>
    <section className="art-wall" aria-label="Projetos e obras">
      {visibleItems.map((artwork, index) => {
        const project = projects.find((item) => item.slug === artwork.projectSlug);
        return <button key={`${artwork._id}-${index}`} data-artwork-id={artwork._id} className={`wall-piece ${presets[index % presets.length]} ${index >= artworks.length ? "wall-flow" : ""} ${artwork.layout}`} onClick={(event) => { openerRef.current = event.currentTarget; setActiveId(event.currentTarget.dataset.artworkId ?? null); }} aria-label={`Ver ${artwork.title}`}>
          <Image src={artwork.image} alt={artwork.alt} fill sizes="(max-width: 640px) 46vw, (max-width: 1000px) 34vw, 25vw" priority={index < 4} />
          <span className="wall-label">{project?.title ?? artwork.title}</span>
        </button>;
      })}
    </section>
    <div id="wall-sentinel" aria-hidden="true" />
    {selected && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="art-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-x" ref={closeRef} onClick={close} aria-label="Fechar">×</button>
        <div className="modal-art"><Image src={selected.image} alt={selected.alt} fill sizes="(max-width: 760px) 90vw, 56vw" priority /></div>
        <div className="modal-info"><p className="eyebrow">{selectedProject?.category ?? "Projeto"}{selectedProject?.year ? `, ${selectedProject.year}` : ""}</p>
          <h2 id="modal-title">{selectedProject?.title ?? selected.title}</h2>
          {selectedProject?.descriptionPt && <p>{selectedProject.descriptionPt.split("\n\n")[0]}</p>}
          <Link className="project-cta" href={`/projetos/${selected.projectSlug}`}>Ver projeto completo <span>→</span></Link>
          <div className="modal-nav"><span>{String(activeIndex + 1).padStart(2, "0")} / {String(artworks.length).padStart(2, "0")}</span><button onClick={() => step(-1)} aria-label="Obra anterior">←</button><button onClick={() => step(1)} aria-label="Próxima obra">→</button></div>
        </div>
      </section>
    </div>}
  </>;
}
