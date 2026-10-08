"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { HomePost } from "@/lib/portfolio";
import styles from "./home-v2-gallery.module.css";

type Props = { posts: HomePost[]; locale: Locale };
type Size = { width: number; height: number };
type Offset = { x: number; y: number };
type Slot = { x: number; y: number; width: number; maxHeight: number; angle: number };

const templates: Slot[][] = [
  [
    { x: .23, y: .48, width: .43, maxHeight: .82, angle: -3 },
    { x: .52, y: .29, width: .32, maxHeight: .53, angle: 2.5 },
    { x: .78, y: .45, width: .4, maxHeight: .78, angle: 3 },
    { x: .52, y: .78, width: .28, maxHeight: .36, angle: -2 },
  ],
  [
    { x: .25, y: .45, width: .43, maxHeight: .77, angle: 2 },
    { x: .55, y: .69, width: .34, maxHeight: .5, angle: -3 },
    { x: .77, y: .34, width: .38, maxHeight: .66, angle: 1.5 },
    { x: .16, y: .75, width: .24, maxHeight: .34, angle: -2 },
  ],
  [
    { x: .23, y: .36, width: .42, maxHeight: .68, angle: -1.5 },
    { x: .58, y: .57, width: .36, maxHeight: .72, angle: 2.5 },
    { x: .82, y: .29, width: .3, maxHeight: .48, angle: -3 },
    { x: .28, y: .77, width: .28, maxHeight: .36, angle: 2 },
  ],
];

const alternateTemplates: Slot[][] = [
  [
    { x: .26, y: .42, width: .42, maxHeight: .78, angle: 2 },
    { x: .57, y: .65, width: .35, maxHeight: .5, angle: -2.5 },
    { x: .79, y: .32, width: .4, maxHeight: .72, angle: -1.5 },
    { x: .46, y: .27, width: .27, maxHeight: .36, angle: 3 },
  ],
  [
    { x: .23, y: .58, width: .41, maxHeight: .7, angle: -2 },
    { x: .52, y: .27, width: .34, maxHeight: .51, angle: 2 },
    { x: .76, y: .50, width: .4, maxHeight: .73, angle: 3 },
    { x: .53, y: .77, width: .27, maxHeight: .35, angle: -2 },
  ],
];

function SceneArtwork({ number, shift }: { number: number; shift: number }) {
  return <div className={`${styles.sceneArtwork} ${styles[`artworkSet${number % 3}`]}`} style={{ "--ambient-x": `${shift}px` } as CSSProperties} aria-hidden="true">
    <svg className={styles.sun} viewBox="0 0 220 220"><path d="M112 6 128 49 166 20 160 67 211 55 181 91 218 116 174 125 196 172 152 152 139 212 111 170 75 211 76 158 23 177 50 136 2 110 50 99 22 51 70 71 79 14 101 55Z" fill="#e9a316"/></svg>
    <svg className={styles.brush} viewBox="0 0 400 220"><path d="M8 139C72 88 95 5 155 27c38 14 40 71 80 46 50-31 70 21 138-31-9 47-58 54-70 87-18 49-65-13-95 17-49 49-107-9-200 38 41-24 40-35 0-45Z" fill="#d62a22"/><path d="M42 176c77-36 115-12 170-15M114 35c44 11 55 41 82 43" fill="none" stroke="#f2c7a1" strokeWidth="5" strokeLinecap="round"/></svg>
    <svg className={styles.squiggle} viewBox="0 0 270 230"><path d="M14 206C112 176 129 117 79 106c-51-11-30 62 21 49 78-19 26-103 93-122 32-9 51-4 64-18" fill="none" stroke="#164c91" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <svg className={styles.dots} viewBox="0 0 150 180"><g fill="#e9232e"><circle cx="26" cy="22" r="9"/><circle cx="91" cy="15" r="6"/><circle cx="115" cy="52" r="10"/><circle cx="47" cy="68" r="6"/><circle cx="79" cy="101" r="9"/><circle cx="20" cy="124" r="8"/><circle cx="126" cy="144" r="7"/><circle cx="51" cy="165" r="5"/></g></svg>
    <svg className={styles.leaf} viewBox="0 0 260 270"><path d="M15 270c49-92 96-162 227-252-20 77-40 132-86 174-45 42-89 23-141 78Z" fill="#174c3b"/><path d="M31 254c58-74 105-121 184-196M70 202l-3-66m52 16 80 6" fill="none" stroke="#f4e7d2" strokeWidth="5"/></svg>
  </div>;
}

function chunkPosts(posts: HomePost[]): HomePost[][] {
  const groups: HomePost[][] = [];
  for (let index = 0; index < posts.length;) {
    const remaining = posts.length - index;
    const count = remaining === 5 ? 3 : Math.min(4, remaining);
    groups.push(posts.slice(index, index + count));
    index += count;
  }
  return groups;
}

function ratioFor(post: HomePost): number {
  if (post.imageAspectRatio && post.imageAspectRatio > 0) return post.imageAspectRatio;
  return post.orientation === "landscape" ? 1.5 : post.orientation === "square" ? 1 : .72;
}

function pieceGeometry(post: HomePost, slot: Slot, stage: Size) {
  const stageWidth = Math.max(stage.width, 760);
  const stageHeight = Math.max(stage.height, 340);
  const ratio = ratioFor(post);
  const scale = post.sizeHint === "small" ? .87 : post.sizeHint === "large" ? 1.08 : post.sizeHint === "hero" ? 1.13 : 1;
  const width = Math.min(stageWidth * slot.width * scale, stageHeight * slot.maxHeight * ratio);
  const height = width / ratio;
  const inset = Math.min(24, stageWidth * .025);
  const left = Math.max(inset, Math.min(stageWidth - width - inset, stageWidth * slot.x - width / 2));
  const top = Math.max(12, Math.min(stageHeight - height - 12, stageHeight * slot.y - height / 2));
  const angle = slot.angle;
  return { left, top, width, height, angle };
}

function labelFor(post: HomePost): string {
  return post.modalTitle || post.artwork?.title || post.project?.title || post.internalName;
}

function imageUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "cdn.sanity.io") {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", "90");
      parsed.searchParams.set("auto", "format");
    }
    return parsed.toString();
  } catch { return url; }
}

const ArtworkPiece = memo(function ArtworkPiece({ post, index, sceneIndex, slot, stage, variant, desktop, onOpen }: {
  post: HomePost; index: number; sceneIndex: number; slot: Slot; stage: Size; variant: number; desktop: boolean; onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ x: number; y: number; origin: Offset; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const geometry = pieceGeometry(post, slot, stage);
  const maxX = stage.width - geometry.left - geometry.width - 12;
  const minX = 12 - geometry.left;
  const maxY = stage.height - geometry.top - geometry.height - 12;
  const minY = 12 - geometry.top;

  useEffect(() => { setOffset({ x: 0, y: 0 }); }, [variant]);

  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!desktop || event.button !== 0) return;
    gesture.current = { x: event.clientX, y: event.clientY, origin: offset, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || !desktop) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.moved && Math.hypot(dx, dy) < 7) return;
    current.moved = true;
    setDragging(true);
    setOffset({ x: Math.max(minX, Math.min(maxX, current.origin.x + dx)), y: Math.max(minY, Math.min(maxY, current.origin.y + dy)) });
  }

  function pointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (!gesture.current) return;
    suppressClick.current = gesture.current.moved;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const style = {
    "--piece-left": `${geometry.left}px`, "--piece-top": `${geometry.top}px`,
    "--piece-width": `${geometry.width}px`, "--piece-height": `${geometry.height}px`,
    "--piece-x": `${offset.x}px`, "--piece-y": `${offset.y}px`, "--piece-angle": `${geometry.angle}deg`,
    "--image-ratio": String(ratioFor(post)),
  } as CSSProperties;
  const title = labelFor(post);
  return <button
    type="button" className={`${styles.piece} ${styles[`piece${index % 4}`]} ${dragging ? styles.dragging : ""}`}
    style={style} aria-label={title} onPointerDown={pointerDown} onPointerMove={pointerMove}
    onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
    onClick={(event) => { if (suppressClick.current) { suppressClick.current = false; return; } onOpen(index, event.currentTarget); }}
    data-scene={sceneIndex + 1} data-home-post={post._id}
  >
    <span className={styles.paper}>
      <picture>
        {post.mobileImage ? <source media="(max-width: 1000px), (pointer: coarse)" srcSet={imageUrl(post.mobileImage, 1080)} /> : null}
        <Image src={post.image!} alt={post.altText || title} fill sizes="(max-width: 1000px) 88vw, 34vw" quality={90}
          priority={index < 2} draggable={false} className={styles.image} />
      </picture>
    </span>
    <span className={styles.pieceLabel}><span><strong>{title}</strong>{(post.technique || post.artwork?.technique) ? <small>{post.technique || post.artwork?.technique}</small> : null}</span><span className={styles.labelArrow} aria-hidden="true">↗</span></span>
  </button>;
});

function ArtworkModal({ posts, index, locale, onClose, onChange }: {
  posts: HomePost[]; index: number; locale: Locale; onClose: () => void; onChange: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const post = posts[index];
  const title = labelFor(post);
  const year = post.year || post.artwork?.year;
  const technique = post.technique || post.artwork?.technique;
  const dimensions = post.dimensions || post.artwork?.dimensions;
  const description = post.description || post.artwork?.description;
  const projectSlug = post.project?.slug || post.artwork?.projectSlug;
  const projectHref = projectSlug ? (locale === "en" ? `/en/projects/${projectSlug}` : `/projetos/${projectSlug}`) : null;

  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = priorOverflow; window.scrollTo(0, scrollY); };
  }, []);
  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "ArrowLeft" && index > 0) { event.preventDefault(); onChange(index - 1); }
      if (event.key === "ArrowRight" && index < posts.length - 1) { event.preventDefault(); onChange(index + 1); }
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
      if (!focusables?.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [index, onChange, onClose, posts.length]);

  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-label={title}
      onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => { if (touchStart.current === null) return; const delta = event.changedTouches[0].clientX - touchStart.current; touchStart.current = null; if (delta < -65 && index < posts.length - 1) onChange(index + 1); if (delta > 65 && index > 0) onChange(index - 1); }}>
      <div className={styles.modalImage}><Image src={post.image!} alt={post.altText || title} fill sizes="(max-width: 800px) 100vw, 70vw" quality={90} priority className={styles.image} /></div>
      <div className={styles.modalInfo}>
        <div className={styles.modalTop}><span>{String(index + 1).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}</span><button ref={closeRef} type="button" onClick={onClose} aria-label={locale === "en" ? "Close artwork" : "Fechar obra"}>×</button></div>
        <div className={styles.modalCopy}><h2>{title}</h2>{year ? <p>{year}</p> : null}{technique ? <p>{technique}</p> : null}{dimensions ? <p>{dimensions}</p> : null}{description ? <p className={styles.description}>{description}</p> : null}{projectHref ? <Link href={projectHref}>{locale === "en" ? "View full project ↗" : "Ver projeto completo ↗"}</Link> : null}</div>
        <div className={styles.modalNav}><button type="button" disabled={index === 0} onClick={() => onChange(index - 1)} aria-label={locale === "en" ? "Previous artwork" : "Obra anterior"}>←</button><button type="button" disabled={index === posts.length - 1} onClick={() => onChange(index + 1)} aria-label={locale === "en" ? "Next artwork" : "Próxima obra"}>→</button></div>
      </div>
    </div>
  </div>;
}

export function HomeV2Gallery({ posts, locale }: Props) {
  const scenes = useMemo(() => chunkPosts(posts), [posts]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const focusReturn = useRef<HTMLButtonElement | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [variants, setVariants] = useState<Record<number, number>>({});
  const sceneWidth = Math.max(760, size.width * .96);
  const pieceStage = useMemo(() => ({ width: sceneWidth, height: size.height }), [sceneWidth, size.height]);
  const step = sceneWidth - 140;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1001px) and (hover: hover) and (pointer: fine)");
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element || !desktop) return;
    function wheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) * 1.2) return;
      event.preventDefault();
      element!.scrollLeft += event.deltaY;
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [desktop]);

  const syncScroll = useCallback(() => {
    const element = viewportRef.current;
    if (!element) return;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    setProgress(max ? element.scrollLeft / max : 0);
    setSceneIndex(max && element.scrollLeft >= max - 3 ? scenes.length - 1 : Math.min(scenes.length - 1, Math.round(element.scrollLeft / step)));
  }, [scenes.length, step]);

  useEffect(() => { syncScroll(); }, [syncScroll, size]);
  const navigate = useCallback((direction: -1 | 1) => {
    const element = viewportRef.current;
    if (!element) return;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    const target = Math.max(0, Math.min(scenes.length - 1, sceneIndex + direction));
    element.scrollTo({ left: Math.min(max, target * step), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [sceneIndex, scenes.length, step]);
  const closeModal = useCallback(() => { setActive(null); requestAnimationFrame(() => focusReturn.current?.focus()); }, []);
  const changeModal = useCallback((index: number) => setActive(index), []);
  const openModal = useCallback((index: number, trigger: HTMLButtonElement) => { focusReturn.current = trigger; setActive(index); }, []);

  let runningIndex = 0;
  return <div className={`home-v2-page ${styles.page}`}>
    {posts.length === 0 ? <p className={styles.empty}>{locale === "en" ? "No artworks are available right now." : "Nenhuma obra disponível no momento."}</p> : <>
      <div ref={stageRef} className={styles.stage}>
        <div ref={viewportRef} className={styles.viewport} tabIndex={0} aria-label={desktop ? (locale === "en" ? "Horizontal artwork gallery" : "Galeria horizontal de obras") : (locale === "en" ? "Vertical artwork gallery" : "Galeria vertical de obras")}
          onScroll={syncScroll} onKeyDown={(event) => { if (!desktop) return; if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); } if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); } }}>
          <div className={styles.track} style={{ opacity: size.width > 0 ? 1 : 0 }}>
            {scenes.map((scene, number) => {
              const start = runningIndex;
              runningIndex += scene.length;
              return <div className={styles.scene} style={{ "--scene-width": `${sceneWidth}px`, "--stage-height": `${size.height}px` } as CSSProperties} key={scene[0]._id} aria-label={`${locale === "en" ? "Composition" : "Composição"} ${number + 1}`}><SceneArtwork number={number} shift={(progress - number / Math.max(1, scenes.length - 1)) * 36} />
                {scene.map((post, localIndex) => <ArtworkPiece key={post._id} post={post} index={start + localIndex} sceneIndex={number}
                  slot={scene.length === 1 ? { x: .5, y: .5, width: .55, maxHeight: .82, angle: -1.5 } : variants[number] ? alternateTemplates[(variants[number] - 1) % alternateTemplates.length][localIndex] : templates[number % templates.length][localIndex]} stage={pieceStage} variant={variants[number] || 0} desktop={desktop} onOpen={openModal} />)}
              </div>;
            })}
          </div>
        </div>
      </div>
      <div className={styles.controls} aria-label={locale === "en" ? "Gallery controls" : "Controles da galeria"}>
        <div className={styles.explore}><span className={styles.signature}>© {new Date().getFullYear()} Jhow.ars</span><span className={styles.progressLine}><i style={{ width: `${progress * 100}%` }} /></span></div>
        <div className={styles.controlActions}><button type="button" onClick={() => setVariants((current) => ({ ...current, [sceneIndex]: current[sceneIndex] === 1 ? 2 : 1 }))} aria-label={locale === "en" ? "Rearrange current composition" : "Reorganizar composição atual"}>{locale === "en" ? "Rearrange" : "Reorganizar"}</button><button type="button" onClick={() => setVariants((current) => ({ ...current, [sceneIndex]: 0 }))} disabled={!variants[sceneIndex]} aria-label={locale === "en" ? "Restore initial composition" : "Restaurar composição inicial"}>{locale === "en" ? "Restore" : "Restaurar"}</button><span className={styles.counter}>{String(sceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span><button type="button" onClick={() => navigate(-1)} disabled={sceneIndex === 0} aria-label={locale === "en" ? "Previous composition" : "Composição anterior"}>←</button><button type="button" onClick={() => navigate(1)} disabled={sceneIndex === scenes.length - 1} aria-label={locale === "en" ? "Next composition" : "Próxima composição"}>→</button></div>
      </div>
    </>}
    {active !== null ? <ArtworkModal posts={posts} index={active} locale={locale} onClose={closeModal} onChange={changeModal} /> : null}
  </div>;
}
