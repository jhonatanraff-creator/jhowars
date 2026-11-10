"use client";

import Image from "next/image";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HomePost } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { curate, planPanel, workName, workYear } from "./composition";
import { useIdentityTheme } from "@/components/identity-shell";
import { EditorialAccents } from "./editorial-accents";
import { useEditionWindow } from "./use-edition-window";
import { Proof } from "./proof";
import { useGalleryMotion } from "./motion";
import styles from "./home-v4.module.css";

const nameOf = workName;
const yearOf = workYear;


export function Gallery({ posts, locale }: { posts: HomePost[]; locale: Locale }) {
  const en = locale === "en";
  const page = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);

  const scrollHint = useRef<HTMLSpanElement>(null);

  const trigger = useRef<HTMLButtonElement | null>(null);

  const [active, setActive] = useState<HomePost | null>(null);
  const { dark, toggle } = useIdentityTheme();
  useEffect(() => { if (page.current) page.current.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  const catalog = useMemo(() => curate(posts), [posts]);
  const window = useEditionWindow(catalog, surface, marker, measure, active !== null, en);
  const { panelAt, start, end } = window;
  const first = panelAt(-1);
  const restoreEditionPosition = window.restorePosition;
  const captureEditionPosition = window.capturePosition;
  const resetEditionPosition = window.toTop;
  const panels = useMemo(() => catalog.all.length ? Array.from({ length: end - start }, (_, i) => { const index = start + i; return { index, panel: panelAt(index) }; }) : [], [catalog, end, start, panelAt]);
  useGalleryMotion(surface);

  const hasWorks = catalog.all.length > 0;
  useEffect(() => {
    const hint = scrollHint.current;
    if (!hasWorks || !hint) return;
    function updateHint() {
      hint!.toggleAttribute("data-dismissed", scrollY > Math.min(160, innerHeight * .24));
    }
    updateHint();
    addEventListener("scroll", updateHint, { passive: true });
    addEventListener("resize", updateHint);
    return () => {
      removeEventListener("scroll", updateHint);
      removeEventListener("resize", updateHint);
    };
  }, [hasWorks]);

  useEffect(() => {
    const saved = (() => {
      try {
        const stored = sessionStorage.getItem("jhow-v4-locale-scroll");
        return stored ? JSON.parse(stored) as { pathname: string; y?: number; anchor?: { index: number; offset: number } } : null;
      } catch { return null; /* Continue without session storage. */ }
    })();
    if (!saved || saved.pathname !== location.pathname || (!saved.anchor && !Number.isFinite(saved.y))) return;
    const target = saved;
    let frame = 0;
    let attempts = 0;
    function restorePosition() {
      const restored = target.anchor ? restoreEditionPosition(target.anchor) : false;
      if (restored) {
        try { sessionStorage.removeItem("jhow-v4-locale-scroll"); } catch { /* Ignore unavailable storage. */ }
        return;
      }
      if (!target.anchor && Number.isFinite(target.y)) globalThis.scrollTo({ top: target.y!, behavior: "instant" });
      if (++attempts < 90) frame = requestAnimationFrame(restorePosition);
    }
    frame = requestAnimationFrame(restorePosition);
    return () => cancelAnimationFrame(frame);
  }, [locale, restoreEditionPosition]);

  useEffect(() => {
    const save = () => {
      const pathname = locale === "en" ? "/home-v4" : "/en/home-v4";
      try { sessionStorage.setItem("jhow-v4-locale-scroll", JSON.stringify({ pathname, y: scrollY, anchor: captureEditionPosition() })); } catch { /* Storage unavailable. */ }
    };
    const top = () => resetEditionPosition();
    globalThis.addEventListener("identity-locale", save);
    globalThis.addEventListener("identity-top", top);
    return () => { globalThis.removeEventListener("identity-locale", save); globalThis.removeEventListener("identity-top", top); };
  }, [locale, captureEditionPosition, resetEditionPosition]);

  function renderPanel(panel: ReturnType<typeof planPanel>, id: number) {
    return <div className={styles.leaf} data-opening={id < 0} data-leaf={id} style={{ height: window.heightAt(id) ?? panel.height }}>
      {panel.statement && <h1 className={styles.statement} style={{left:panel.statement.x,top:panel.statement.y,width:panel.statement.width}}><span>{en ? "Artist, illustrator, printmaker," : "Artista, ilustrador, impressor,"}</span><span><em>{en ? "questioner" : "questionador"}</em>, etc.</span></h1>}
      {panel.tiles.map(({ post, box, ratio, motion, protectedBox, scale }, order) => {
        return <figure key={post._id} data-tile data-depth={scale} data-work={post._id} data-motion-scroll={motion.scroll} data-motion-mouse={motion.mouse} data-envelope={JSON.stringify(protectedBox)} data-print={id >= 0 ? "" : undefined} className={styles.tile} style={{ left:box.x,top:box.y,width:box.width,"--ratio":ratio,"--reveal-delay": `${Math.min(order, 3) * 42}ms` } as CSSProperties}>
          <div className={styles.parallax} data-parallax-layer>
          <div className={styles.scene} data-scene-drift>
          <button type="button" className={styles.artButton} aria-label={`${en ? "Open" : "Abrir"} ${nameOf(post)}`} onClick={event => { trigger.current = event.currentTarget; setActive(post); }}>
            <span className={styles.frame}>
              <Image src={post.image!} alt={post.altText || nameOf(post)} fill sizes={Math.ceil(box.width) + "px"} priority={id < 0 && order < 4} />
              <span className={styles.register} aria-hidden="true">+</span>
            </span>
            <span className={styles.caption}><span>{nameOf(post)}</span>{yearOf(post) && <em>{yearOf(post)}</em>}<span className={styles.arrow} aria-hidden="true">↗</span></span>
          </button>
          </div>
          </div>
        </figure>;
      })}
      <EditorialAccents editorial={panel.editorial} locale={locale} />
    </div>;
  }

  return <div ref={page} className={styles.page} data-v4-shell id="topo">
    <div className={styles.themeInk} data-theme-ink aria-hidden="true" />
    <div ref={surface} className={styles.surface}>
      {window.base === 0 && renderPanel(first, -1)}
      <div id="continuar" ref={marker} />
      <div ref={measure} className={styles.measure} aria-hidden="true" />
      <div className={styles.spacer} aria-hidden="true" style={{ height: window.spacer }} />
      {panels.map(({ panel, index }) => <div key={index}>{renderPanel(panel, index)}</div>)}
      {window.runway > 0 && <div aria-hidden="true" style={{ height: window.runway }} />}
      {!catalog.all.length && <p className={styles.empty}>{en ? "The gallery is temporarily unavailable." : "A galeria está temporariamente indisponível."}</p>}
    </div>
    {hasWorks && <span ref={scrollHint} className={styles.scrollHint} data-v4-scroll-hint aria-hidden="true">
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><path d="M7 1v19m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>}
    <Proof dark={dark} toggleTheme={toggle} post={active} posts={catalog.all} locale={locale} trigger={trigger} onChange={setActive} />
  </div>;
}
