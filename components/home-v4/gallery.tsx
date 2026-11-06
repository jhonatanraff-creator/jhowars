"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HomePost, SiteSettings } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { curate, panelSource, planPanel, ratioOf } from "./composition";
import { EditorialAccents } from "./editorial-accents";
import { useEditionWindow } from "./use-edition-window";
import { Proof } from "./proof";
import { usePrintReveal, useTheme } from "./motion";
import styles from "./home-v4.module.css";

const nameOf = (post: HomePost) => post.modalTitle || post.artwork?.title || post.project?.title || post.internalName;
const yearOf = (post: HomePost) => post.year || post.artwork?.year || post.project?.year;

export function Gallery({ posts, locale, settings }: { posts: HomePost[]; locale: Locale; settings: SiteSettings | null }) {
  const en = locale === "en";
  const page = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const scrollHint = useRef<HTMLSpanElement>(null);

  const trigger = useRef<HTMLButtonElement | null>(null);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState<HomePost | null>(null);
  const { dark, toggle } = useTheme(page);
  const catalog = useMemo(() => curate(posts), [posts]);
  const first = useMemo(() => planPanel(catalog.first, -1), [catalog]);
  const window = useEditionWindow(catalog, surface, marker, measure, active !== null);
  const panels = useMemo(() => catalog.all.length ? Array.from({ length: window.end - window.start }, (_, i) => { const index = window.start + i; return { index, panel: planPanel(panelSource(catalog, index), index) }; }) : [], [catalog, window.end, window.start]);
  usePrintReveal(surface);

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
    return <div className={styles.leaf} data-opening={id < 0} data-leaf={id} style={{ "--mobile-height": panel.mobileHeight, "--statement-top": panel.statementTop, height: id < 0 ? undefined : window.heightAt(id) } as CSSProperties}>
      {id < 0 && <h1 className={styles.statement}><span>{en ? "Artist, illustrator, printmaker" : "Artista, ilustrador, impressor"}</span><span><em>{en ? "questioner" : "questionador"}</em>{en ? ", etc." : ", etc."}</span></h1>}
      {panel.tiles.map(({ post, slot: [x, y, w, h], mobile: [mx, my, mw] }, order) => {
        const ratio = ratioOf(post);
        return <figure key={post._id} data-tile data-work={post._id} data-print={id >= 0 ? "" : undefined} className={styles.tile} style={{ "--x": x, "--y": y, "--w": w, "--h": h, "--mx": mx, "--my": my, "--mw": mw, "--ratio": ratio ?? 1, "--align": w >= 43 ? .5 : 0, "--reveal-delay": `${Math.min(order, 3) * 42}ms` } as CSSProperties}>
          <button type="button" className={styles.artButton} aria-label={`${en ? "Open" : "Abrir"} ${nameOf(post)}`} onClick={event => { trigger.current = event.currentTarget; setActive(post); }}>
            <span className={styles.frame}>
              {ratio ? <Image src={post.image!} alt={post.altText || nameOf(post)} fill sizes={`(max-width: 900px) ${Math.ceil(mw * .91)}vw, ${Math.ceil(w * .938)}vw`} priority={id < 0} /> : <Image src={post.image!} alt={post.altText || nameOf(post)} fill sizes="90vw" />}
              <span className={styles.register} aria-hidden="true">+</span>
            </span>
            <span className={styles.caption}><span>{nameOf(post)}</span>{yearOf(post) && <em>{yearOf(post)}</em>}<span className={styles.arrow} aria-hidden="true">↗</span></span>
          </button>
        </figure>;
      })}
      <EditorialAccents layout={panel.layout} mirror={panel.mirror} locale={locale} />
    </div>;
  }

  return <div ref={page} className={styles.page} data-v4-shell id="topo">
    <div className={styles.themeInk} data-theme-ink aria-hidden="true" />
    {window.base === 0 && <header className={styles.header}>
      <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menu} aria-controls="v4-menu" aria-label={menu ? (en ? "Close menu" : "Fechar menu") : (en ? "Open menu" : "Abrir menu")} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
      <a href="#topo" className={styles.logo} aria-label={en ? "Jhow.ars, back to top" : "Jhow.ars, voltar ao início"}><Image src="/brand/home-v4/assinatura.svg" width={1192} height={664} alt="Jhow.ars" priority /></a>
      <div className={styles.controls}><Link aria-current={!en ? "page" : undefined} href="/home-v4">PT</Link><Link aria-current={en ? "page" : undefined} href="/en/home-v4">EN</Link><button type="button" aria-pressed={dark} className={styles.theme} aria-label={dark ? (en ? "Switch to light theme" : "Ativar tema claro") : (en ? "Switch to dark theme" : "Ativar tema escuro")} onClick={toggle}><span /></button></div>
      <div className={styles.scrim} data-open={menu} aria-hidden="true" onClick={() => closeMenu(true)} />
      <nav id="v4-menu" className={styles.menu} data-open={menu} inert={!menu} aria-label={en ? "Main menu" : "Menu principal"} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButton.current) closeMenu(); }}>
        <Link href={projects}>{en ? "Projects" : "Projetos"}</Link><Link href={about}>{en ? "About" : "Sobre"}</Link><a href={contact}>{en ? "Contact" : "Contato"}</a>
        <div className={styles.social}>{settings?.instagram && <a href={settings.instagram}>Instagram ↗</a>}{settings?.behance && <a href={settings.behance}>Behance ↗</a>}{settings?.linkedin && <a href={settings.linkedin}>LinkedIn ↗</a>}</div>
      </nav>
    </header>}
    <div ref={surface} className={styles.surface}>
      {window.base === 0 && renderPanel(first, -1)}
      <div id="continuar" ref={marker} />
      <div ref={measure} className={styles.measure} aria-hidden="true" />
      <div className={styles.spacer} aria-hidden="true" style={{ height: window.spacer }} />
      {panels.map(({ panel, index }) => <div key={index}>{renderPanel(panel, index)}</div>)}
      {window.runway > 0 && <div aria-hidden="true" style={{ height: window.runway }} />}
      {!catalog.all.length && <p className={styles.empty}>{en ? "The gallery is temporarily unavailable." : "A galeria está temporariamente indisponível."}</p>}
    </div>
    <footer className={styles.imprint} data-v4-footer>
      <div className={styles.imprintInner}>
        <a className={styles.isotype} href="#topo" aria-label={en ? "Back to top" : "Voltar ao início"} onClick={event => { event.preventDefault(); window.toTop(); }}><Image src="/brand/home-v4/isotipo.svg" alt="" width={556} height={598} priority /></a>
        <a className={styles.footerContact} href="mailto:jhow@jhowars.com">jhow@jhowars.com</a>
        <span className={styles.footerPlace}>Based in: {en ? "Brazil" : "Brasil"}</span>
        <span className={styles.footerAvailability}>{en ? "Available for collaborations, partnerships and projects with a distinct voice" : "Disponível para: colaborações, parcerias e projetos com identidade autoral"}</span>
        <span className={styles.footerCredit}>© 2026 Jhow.ars. All rights reserved</span>
      </div>
    </footer>
    {hasWorks && <span ref={scrollHint} className={styles.scrollHint} data-v4-scroll-hint aria-hidden="true">
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><path d="M7 1v19m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>}
    <Proof dark={dark} toggleTheme={toggle} post={active} posts={catalog.all} locale={locale} trigger={trigger} onChange={setActive} />
  </div>;
}
