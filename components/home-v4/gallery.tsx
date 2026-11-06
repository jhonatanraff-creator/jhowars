"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HomePost, SiteSettings } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { curate, panelSource, planPanel, ratioOf } from "./composition";
import { useEditionWindow } from "./use-edition-window";
import { Proof } from "./proof";
import { usePrintReveal, useTheme } from "./motion";
import styles from "./home-v4.module.css";

export const nameOf = (post: HomePost) => post.modalTitle || post.artwork?.title || post.project?.title || post.internalName;
export const yearOf = (post: HomePost) => post.year || post.artwork?.year || post.project?.year;

export function Gallery({ posts, locale, settings }: { posts: HomePost[]; locale: Locale; settings: SiteSettings | null }) {
  const en = locale === "en";
  const page = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  const trigger = useRef<HTMLButtonElement | null>(null);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState<HomePost | null>(null);
  const { dark, toggle } = useTheme(page);
  const catalog = useMemo(() => curate(posts), [posts]);
  const first = useMemo(() => planPanel(catalog.first, -1), [catalog]);
  const window = useEditionWindow(catalog, surface, marker, measure, active !== null);
  const panels = useMemo(() => catalog.all.length ? Array.from({ length: window.end - window.start }, (_, i) => { const index = window.start + i; return { index, panel: planPanel(panelSource(catalog, index), index) }; }) : [], [catalog, window.end, window.start]);
  usePrintReveal(page);

  function closeMenu(restore = false) {
    setMenu(false);
    if (restore) menuButton.current?.focus();
  }

  useEffect(() => {
    if (!menu) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(false); menuButton.current?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);

  const email = settings?.email;
  const about = en ? "/en/about" : "/sobre";
  const projects = en ? "/en/projects" : "/projetos";
  const contact = email ? `mailto:${email}` : about;

  function renderPanel(panel: ReturnType<typeof planPanel>, id: number) {
    return <div className={styles.leaf} data-opening={id < 0} data-leaf={id} style={{ "--mobile-height": panel.mobileHeight, "--statement-top": panel.statementTop } as CSSProperties} onFocusCapture={event => {
      const tile = (event.target as HTMLElement).closest<HTMLElement>("[data-print]");
      if (tile) tile.dataset.printed = "true";
    }}>
      {id < 0 && <h1 className={styles.statement}><span>{en ? "Artist, illustrator, printmaker" : "Artista, ilustrador, impressor"}</span><span><em>{en ? "questioner" : "questionador"}</em>{en ? ", etc." : ", etc."}</span></h1>}
      {panel.tiles.map(({ post, slot: [x, y, w, h], mobile: [mx, my, mw], ink }) => {
        const ratio = ratioOf(post);
        return <figure key={post._id} data-tile data-ink={ink} data-print={id >= 0 ? "" : undefined} className={styles.tile} style={{ "--x": x, "--y": y, "--w": w, "--h": h, "--mx": mx, "--my": my, "--mw": mw, "--ratio": ratio ?? 1 } as CSSProperties}>
          <button type="button" className={styles.artButton} aria-label={`${en ? "Open" : "Abrir"} ${nameOf(post)}`} onClick={event => { trigger.current = event.currentTarget; setActive(post); }}>
            <span className={styles.frame}>
              {ratio ? <Image src={post.image!} alt={post.altText || nameOf(post)} fill sizes={`(max-width: 900px) ${Math.ceil(mw * .91)}vw, ${Math.ceil(w * .938)}vw`} priority={id < 0} /> : <Image src={post.image!} alt={post.altText || nameOf(post)} fill sizes="90vw" />}
              <span className={styles.register} aria-hidden="true">+</span>
            </span>
            <span className={styles.caption}><span>{nameOf(post)}</span>{yearOf(post) && <em>{yearOf(post)}</em>}<span className={styles.arrow} aria-hidden="true">↗</span></span>
          </button>
        </figure>;
      })}
    </div>;
  }

  return <div ref={page} className={styles.page} data-v4-shell id="topo">
    <div className={styles.themeInk} data-theme-ink aria-hidden="true" />
    <header className={styles.header}>
      <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menu} aria-controls="v4-menu" aria-label={menu ? (en ? "Close menu" : "Fechar menu") : (en ? "Open menu" : "Abrir menu")} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
      <a href="#topo" className={styles.logo} aria-label={en ? "Jhow.ars, back to top" : "Jhow.ars, voltar ao início"}><Image src="/brand/home-v4/assinatura.svg" width={1192} height={664} alt="Jhow.ars" priority /></a>
      <div className={styles.controls}><Link aria-current={!en ? "page" : undefined} href="/home-v4">PT</Link><Link aria-current={en ? "page" : undefined} href="/en/home-v4">EN</Link><button type="button" aria-pressed={dark} className={styles.theme} aria-label={dark ? (en ? "Switch to light theme" : "Ativar tema claro") : (en ? "Switch to dark theme" : "Ativar tema escuro")} onClick={toggle}><span /></button></div>
      <div className={styles.scrim} data-open={menu} aria-hidden="true" onClick={() => closeMenu(true)} />
      <nav id="v4-menu" className={styles.menu} data-open={menu} inert={!menu} aria-label={en ? "Main menu" : "Menu principal"} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButton.current) closeMenu(); }}>
        <Link href={projects}>{en ? "Projects" : "Projetos"}</Link><Link href={about}>{en ? "About" : "Sobre"}</Link><a href={contact}>{en ? "Contact" : "Contato"}</a>
        <div className={styles.social}>{settings?.instagram && <a href={settings.instagram}>Instagram ↗</a>}{settings?.behance && <a href={settings.behance}>Behance ↗</a>}{settings?.linkedin && <a href={settings.linkedin}>LinkedIn ↗</a>}</div>
      </nav>
    </header>
    <div ref={surface} className={styles.surface}>
      {renderPanel(first, -1)}
      <div className={styles.imprint}>
        <a className={styles.isotype} href="#topo" aria-label={en ? "Back to top" : "Voltar ao início"}><Image src="/brand/home-v4/isotipo.svg" alt="" width={556} height={598} /></a>
        {email && <a href={contact}>{email}</a>}<span>{en ? "Based in Brazil" : "Brasil"}</span><span>© Jhow.ars</span>
        {!!catalog.all.length && <a href="#continuar" className={styles.explore}>{en ? "Explore" : "Explorar"} <span aria-hidden="true">↓</span></a>}
      </div>
      <div id="continuar" ref={marker} />
      <div ref={measure} className={styles.measure} aria-hidden="true" />
      <div className={styles.spacer} aria-hidden="true" style={{ "--discarded": window.start, "--discarded-mobile": window.mobileUnits } as CSSProperties} />
      {panels.map(({ panel, index }) => <div key={index}>{renderPanel(panel, index)}</div>)}
      {!catalog.all.length && <p className={styles.empty}>{en ? "The gallery is temporarily unavailable." : "A galeria está temporariamente indisponível."}</p>}
    </div>
    <Proof post={active} posts={catalog.all} locale={locale} trigger={trigger} onChange={setActive} />
  </div>;
}
