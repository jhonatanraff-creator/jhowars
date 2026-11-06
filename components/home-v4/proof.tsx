"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { HomePost } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { ratioOf } from "./composition";
import { reducedMotion } from "./motion";
import styles from "./home-v4.module.css";

const titleOf = (post: HomePost) => post.modalTitle || post.artwork?.title || post.project?.title || post.internalName;

function fit(frame: HTMLElement, ratio: number) {
  const r = frame.getBoundingClientRect();
  const width = Math.min(r.width, r.height * ratio);
  const height = width / ratio;
  return new DOMRect(r.x + (r.width - width) / 2, r.y + (r.height - height) / 2, width, height);
}

function fly(host: HTMLDialogElement, source: HTMLImageElement, from: DOMRect, to: DOMRect, reverse: boolean) {
  if (!source.animate || !source.complete || !source.naturalWidth || !from.width || !to.width || reducedMotion()) return;
  const clone = document.createElement("img");
  clone.src = source.currentSrc || source.src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed", pointerEvents: "none", zIndex: "10", left: `${to.left}px`, top: `${to.top}px`,
    width: `${to.width}px`, height: `${to.height}px`, objectFit: "contain", transformOrigin: "0 0",
  });
  host.appendChild(clone);
  const start = `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`;
  const animation = clone.animate([{ transform: start }, { transform: "none" }], {
    duration: reverse ? 390 : 560, easing: "cubic-bezier(.2,.75,.23,1)", fill: "both",
  });
  return { animation, read: () => clone.getBoundingClientRect(), remove: () => clone.remove() };
}

export function Proof({ post, posts, locale, trigger, onChange, dark, toggleTheme }: {
  post: HomePost | null; posts: HomePost[]; locale: Locale; dark: boolean; toggleTheme: () => void;
  trigger: RefObject<HTMLButtonElement | null>; onChange: (post: HomePost | null) => void;
}) {
  const en = locale === "en";
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const running = useRef<ReturnType<typeof fly>>(undefined);
  const original = useRef<string | null>(null);
  const unlock = useRef<(() => void) | null>(null);
  const scrollBefore = useRef(0);
  const closing = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [slide, setSlide] = useState(0);
  const [leaving, setLeaving] = useState(false);

  function cancelFlight() {
    running.current?.animation.cancel();
    running.current?.remove();
    running.current = undefined;
  }

  useLayoutEffect(() => {
    const el = dialog.current;
    if (!el || !post || el.open) return;
    original.current = post._id;
    const image = trigger.current?.querySelector("img");
    const from = image?.getBoundingClientRect();
    scrollBefore.current = window.scrollY;
    const body = document.body.style;
    const root = document.documentElement.style;
    const previousStyles = [body.overflow, root.overflow, root.overscrollBehavior, root.scrollbarGutter, body.paddingInlineEnd];
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const padding = getComputedStyle(document.body).paddingInlineEnd;
    if (gutter > 0) body.paddingInlineEnd = `calc(${padding} + ${gutter}px)`;
    root.scrollbarGutter = "auto";
    body.overflow = "hidden";
    root.overflow = "hidden";
    root.overscrollBehavior = "none";
    unlock.current = () => {
      [body.overflow, root.overflow, root.overscrollBehavior, root.scrollbarGutter, body.paddingInlineEnd] = previousStyles;
      unlock.current = null;
    };
    el.showModal();
    if (image && from && frame.current) {
      const to = fit(frame.current, ratioOf(post) ?? (image.naturalWidth / image.naturalHeight || 1));
      const flight = fly(el, image, from, to, false);
      if (flight) {
        running.current = flight;
        el.dataset.flying = "true";
        void flight.animation.finished.then(() => {
          if (running.current !== flight) return;
          flight.remove(); running.current = undefined; delete el.dataset.flying;
        }).catch(() => {});
      }
    }
    closeButton.current?.focus({ preventScroll: true });
  }, [post, trigger]);

  useLayoutEffect(() => {
    function resize() {
      const el = dialog.current;
      if (!el?.open || closing.current) return;
      cancelFlight();
      delete el.dataset.flying;
    }
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      unlock.current?.();
      cancelFlight();
    };
  }, []);

  if (!post) return null;

  const added = [...(post.modalGallery ?? []), ...(post.artwork?.images ?? [])];
  const images = [{ image: post.image!, alt: post.altText }, ...added].filter((item, i, list) => item.image && list.findIndex(other => other.image === item.image) === i);
  const current = images[slide] ?? images[0];
  const index = posts.findIndex(item => item._id === post._id);
  const slug = post.project?.slug || post.artwork?.projectSlug;
  const year = post.year || post.artwork?.year || post.project?.year;
  const technique = post.technique || post.artwork?.technique;
  const dimensions = post.dimensions || post.artwork?.dimensions;
  const edition = post.edition || post.artwork?.edition;
  const description = post.description || post.artwork?.description;

  function close() {
    const el = dialog.current;
    if (!el || closing.current) return;
    closing.current = true;
    const image = trigger.current?.querySelector("img");
    const rect = image?.getBoundingClientRect();
    const flightPosition = running.current?.read();
    const finish = () => {
      delete el.dataset.flying;
      el.close(); unlock.current?.();
      if (window.scrollY !== scrollBefore.current) window.scrollTo({ top: scrollBefore.current, behavior: "instant" });
      closing.current = false; setLeaving(false); setSlide(0); onChange(null);
      trigger.current?.focus({ preventScroll: true });
    };
    cancelFlight();
    if (image && rect && frame.current && slide === 0 && original.current === post?._id) {
      const from = flightPosition ?? fit(frame.current, ratioOf(post) ?? (image.naturalWidth / image.naturalHeight || 1));
      const flight = fly(el, image, from, rect, true);
      if (flight) {
        running.current = flight; el.dataset.flying = "true"; setLeaving(true);
        void flight.animation.finished.then(() => { flight.remove(); running.current = undefined; finish(); }).catch(() => {});
        return;
      }
    }
    finish();
  }

  function move(direction: number) {
    const next = posts[index + direction];
    if (!next || closing.current) return;
    cancelFlight();
    if (dialog.current) delete dialog.current.dataset.flying;
    setSlide(0); onChange(next);
  }

  return createPortal(<dialog ref={dialog} className={styles.dialog} data-theme={dark ? "dark" : "light"} aria-labelledby="v4-proof-title" data-leaving={leaving}
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { if (event.target === event.currentTarget) close(); }}
    onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
    }}>
    <div className={styles.proof}>
      <div className={styles.proofControls}>
      <button type="button" aria-pressed={dark} className={styles.theme} aria-label={dark ? (en ? "Switch to light theme" : "Ativar tema claro") : (en ? "Switch to dark theme" : "Ativar tema escuro")} onClick={toggleTheme}><span /></button>
      <button ref={closeButton} className={styles.close} type="button" onClick={close} aria-label={en ? "Close artwork" : "Fechar obra"}>×</button></div>
      <div ref={frame} className={styles.proofFrame}
        onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        onTouchEnd={event => { const origin = touch.current; touch.current = null; const end = event.changedTouches[0]; if (!origin || !end) return; const dx = end.clientX - origin.x; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - origin.y) * 1.5) move(dx < 0 ? 1 : -1); }}>
        <Image key={current.image} src={current.image!} alt={current.alt || titleOf(post)} fill sizes="(max-width: 700px) 94vw, 70vw" loading="eager" />
      </div>
      <div className={styles.proofDetails}>
        <span className={styles.proofNumber}>{String(index + 1).padStart(2, "0")} / {posts.length}</span>
        <div className={styles.proofCopy} key={post._id}>
          <h2 id="v4-proof-title">{titleOf(post)}</h2>
          {(year || technique || dimensions || edition) && <p className={styles.specs}>{[year, technique, dimensions, edition].filter(Boolean).join(" · ")}</p>}
          {description && <p>{description}</p>}
          {slug && <Link href={`${en ? "/en/projects/" : "/projetos/"}${slug}`}>{en ? "View project" : "Ver projeto"} ↗</Link>}
        </div>
        {images.length > 1 && <div className={styles.proofImages} aria-label={en ? "Artwork images" : "Imagens da obra"}>{images.map((item, i) =>
          <button key={item.image} type="button" aria-pressed={slide === i} aria-label={`${en ? "Image" : "Imagem"} ${i + 1}`} onClick={() => setSlide(i)}>{String(i + 1).padStart(2, "0")}</button>)}</div>}
        <div className={styles.proofNav}>
          <button type="button" disabled={index < 1 || leaving} onClick={() => move(-1)} aria-label={en ? "Previous artwork" : "Obra anterior"}>←</button>
          <button type="button" disabled={index >= posts.length - 1 || leaving} onClick={() => move(1)} aria-label={en ? "Next artwork" : "Próxima obra"}>→</button>
        </div>
      </div>
    </div>
  </dialog>, document.body);
}
