"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HomePost } from "@/lib/portfolio";

const palettes = ["#e63b2e", "#f2c230", "#1d4fa3", "#e94c95", "#f07a2b", "#111111"];
const alignments = ["left", "right", "left", "center", "right", "left", "center", "right"];

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function batchOrder(posts: HomePost[], round: number) {
  const ordered = [...posts].sort((a, b) => stableHash(`${round}:${a._id}`) - stableHash(`${round}:${b._id}`));
  return ordered;
}

function sizeFor(post: HomePost) {
  switch (post.sizeHint) {
    case "hero": return "88vw";
    case "large": return "66vw";
    case "medium": return "50vw";
    case "small": return "32vw";
    default: return post.orientation === "landscape" ? "66vw" : "50vw";
  }
}

function PostImage({ post, alt, priority = false }: { post: HomePost; alt: string; priority?: boolean }) {
  return <>
    <Image className="post-desktop-image" src={post.image!} alt={alt} fill sizes="(max-width: 640px) 92vw, 88vw" priority={priority} />
    {post.mobileImage && <Image className="post-mobile-image" src={post.mobileImage} alt={alt} fill sizes="92vw" priority={priority} />}
  </>;
}

export function ArtworkWall({ homePosts }: { homePosts: HomePost[] }) {
  const [posts, setPosts] = useState<HomePost[]>(homePosts.slice(0, 8));
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const selected = activePostId === null ? null : homePosts.find((post) => post._id === activePostId) ?? null;
  const gallery = useMemo(() => {
    if (!selected) return [];
    const selectedImages = selected.modalGallery.filter((entry) => entry.image);
    const artworkImages = selected.artwork?.images?.filter((entry) => entry.image) ?? [];
    const source = selectedImages.length ? selectedImages : artworkImages.length ? artworkImages : [{ _key: "main", image: selected.image, alt: selected.altText }];
    return source.filter((entry): entry is typeof entry & { image: string } => Boolean(entry.image));
  }, [selected]);
  const currentImage = gallery[imageIndex] ?? gallery[0];
  const title = selected?.modalTitle || selected?.artwork?.title || selected?.project?.title || selected?.internalName || "";
  const projectSlug = selected?.project?.slug || selected?.artwork?.projectSlug;
  const year = selected?.year ?? selected?.artwork?.year ?? selected?.project?.year;
  const technique = selected?.technique ?? selected?.artwork?.technique;
  const dimensions = selected?.dimensions ?? selected?.artwork?.dimensions;
  const edition = selected?.edition ?? selected?.artwork?.edition;
  const description = selected?.description ?? selected?.artwork?.description ?? selected?.project?.summary;

  const close = useCallback(() => setActivePostId(null), []);
  const stepImage = useCallback((delta: number) => setImageIndex((current) => (current + delta + gallery.length) % gallery.length), [gallery.length]);

  useEffect(() => {
    if (!sentinelRef.current || homePosts.length === 0) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setPosts((currentPosts) => {
        const nextBatch = Math.floor(currentPosts.length / Math.max(homePosts.length, 1)) + 1;
        const next = batchOrder(homePosts, nextBatch);
        const previousId = currentPosts[currentPosts.length - 1]?._id;
        if (next.length > 1 && next[0]?._id === previousId) next.push(next.shift()!);
        return [...currentPosts, ...next];
      });
      observer.unobserve(sentinelRef.current!);
      requestAnimationFrame(() => sentinelRef.current && observer.observe(sentinelRef.current));
    }, { root: document.querySelector(".art-viewport"), rootMargin: "900px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [homePosts]);

  useEffect(() => {
    if (!selected) return;
    const viewport = document.querySelector<HTMLElement>(".art-viewport");
    const oldOverflow = viewport?.style.overflowY ?? "";
    if (viewport) viewport.style.overflowY = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (gallery.length > 1 && event.key === "ArrowRight") stepImage(1);
      if (gallery.length > 1 && event.key === "ArrowLeft") stepImage(-1);
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
    return () => {
      if (viewport) viewport.style.overflowY = oldOverflow;
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [selected, close, gallery.length, stepImage]);

  return <>
    <div className="art-viewport" aria-label="Obras em destaque">
      <section className="art-stream" aria-label="Publicações da Home">
        {posts.map((post, index) => {
          const alignment = alignments[index % alignments.length];
          const hoverColor = palettes[stableHash(post._id) % palettes.length];
          const ratio = post.imageAspectRatio && post.imageAspectRatio > 0 ? post.imageAspectRatio : post.orientation === "portrait" ? 0.72 : post.orientation === "square" ? 1 : 1.36;
          return <article key={`${post._id}-${index}`} className={`home-post align-${alignment} orientation-${post.orientation}`} style={{ "--post-width": sizeFor(post), "--hover-color": hoverColor, "--image-ratio": ratio } as React.CSSProperties}>
            <button className="home-post-trigger" onClick={(event) => { openerRef.current = event.currentTarget; setImageIndex(0); setActivePostId(post._id); }} aria-label={`Ver ${post.altText || post.modalTitle || post.artwork?.title || post.project?.title || post.internalName}`}>
              <span className="home-post-default"><PostImage post={post} alt={post.altText || post.internalName} priority={index === 0} /></span>
              <span className="home-post-hover-state" aria-hidden="true"><span className="home-post-hover-image"><PostImage post={post} alt="" /></span><span className="home-post-hover-title">{post.modalTitle || post.artwork?.title || post.project?.title || post.internalName}</span></span>
            </button>
          </article>;
        })}
        <div ref={sentinelRef} className="stream-sentinel" aria-hidden="true" />
        {posts.length === 0 && <p className="home-empty">Nenhuma publicação ativa na Home.</p>}
      </section>
    </div>
    {selected && currentImage && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="art-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-x" ref={closeRef} onClick={close} aria-label="Fechar">×</button>
        <div className="modal-art"><Image src={currentImage.image} alt={currentImage.alt || selected.altText || title} fill sizes="(max-width: 760px) 90vw, 56vw" priority /></div>
        <div className="modal-info"><p className="eyebrow">Obra{year ? ` · ${year}` : ""}</p>
          <h2 id="modal-title">{title}</h2>
          <dl className="modal-metadata">
            {technique && <div><dt>Técnica</dt><dd>{technique}</dd></div>}
            {dimensions && <div><dt>Dimensões</dt><dd>{dimensions}</dd></div>}
            {edition && <div><dt>Edição</dt><dd>{edition}</dd></div>}
          </dl>
          {description && <p className="modal-description">{description}</p>}
          {projectSlug && <Link className="project-cta" href={`/projetos/${projectSlug}`}>Ver projeto completo <span>→</span></Link>}
          {gallery.length > 1 && <div className="modal-nav"><span>{String(imageIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span><button onClick={() => stepImage(-1)} aria-label="Imagem anterior">←</button><button onClick={() => stepImage(1)} aria-label="Próxima imagem">→</button></div>}
        </div>
      </section>
    </div>}
  </>;
}
