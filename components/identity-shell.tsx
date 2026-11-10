"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SiteHeader } from "./site-header";
import { Footer } from "./footer";
import { JhowIsotype } from "./brand/JhowIsotype";
import { SocialIcon } from "./home-v4/social-icon";
import { useTheme } from "./home-v4/motion";
import { counterpartPath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/portfolio";
import { fallbackSiteSettings } from "@/data/legacy-cms";
import v from "./home-v4/home-v4.module.css";
import s from "./identity-shell.module.css";

const Theme = createContext({dark:false,toggle:()=>{}});
export const useIdentityTheme = () => useContext(Theme);
const boot = `try{var t=localStorage.getItem('jhow-v4-theme');document.documentElement.dataset.identityTheme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}`;

export function IdentityShell({children,settings,settingsByLocale}:{children:React.ReactNode;settings:SiteSettings|null;settingsByLocale:Record<Locale,SiteSettings|null>}) {
  const path=usePathname() || "/";
  const enabled=/^\/(?:en\/)?home-v4$|^\/projetos(?:\/|$)|^\/en\/projects(?:\/|$)|^\/sobre$|^\/en\/about$|^\/contato$|^\/en\/contact$/.test(path);
  return enabled ? <EditorialShell path={path} settings={settingsByLocale[path.startsWith('/en/')?'en':'pt'] ?? settings}>{children}</EditorialShell> : <><SiteHeader settings={settings} settingsByLocale={settingsByLocale}/><main>{children}</main><Footer settings={settings} settingsByLocale={settingsByLocale}/></>;
}

function EditorialShell({children,path,settings}:{children:React.ReactNode;path:string;settings:SiteSettings|null}) {
  const root=useRef<HTMLDivElement>(null);
  const theme=useTheme(root);
  const en=path.startsWith('/en/');
  const home=en?'/en/home-v4':'/home-v4';
  const isHome=path===home;
  const [open,setOpen]=useState(false);
  const button=useRef<HTMLButtonElement>(null);
  const nav=useRef<HTMLElement>(null);
  const previousPath=useRef(path);
  const links=[{href:en?'/en/projects':'/projetos',label:en?'Projects':'Projetos'}, {href:en?'/en/about':'/sobre',label:en?'About':'Sobre'}, {href:en?'/en/contact':'/contato',label:en?'Contact':'Contato'}];
  const languagePath=(locale:Locale)=>isHome ? locale==='en'?'/en/home-v4':'/home-v4' : path==='/contato'||path==='/en/contact' ? locale==='en'?'/en/contact':'/contato' : counterpartPath(path,locale);
  useEffect(()=>{document.documentElement.dataset.identityTheme=theme.dark?'dark':'light';},[theme.dark]);
  useEffect(()=>{if(previousPath.current!==path){setOpen(false);previousPath.current=path;}},[path]);
  useEffect(()=>{
    if(!open)return;
    nav.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setOpen(false);button.current?.focus();}
      if(event.key==='Tab'){
        const items=[button.current,...Array.from(nav.current?.querySelectorAll<HTMLAnchorElement>('a')??[])].filter(Boolean) as HTMLElement[];
        const i=items.indexOf(document.activeElement as HTMLElement);
        if(event.shiftKey&&i===0){event.preventDefault();items.at(-1)?.focus();}
        else if(!event.shiftKey&&i===items.length-1){event.preventDefault();items[0]?.focus();}
      }
    };
    const resized=()=>{if(innerWidth>900)setOpen(false);};
    addEventListener('keydown',key);addEventListener('resize',resized);
    return()=>{removeEventListener('keydown',key);removeEventListener('resize',resized);};
  },[open]);
  return <Theme.Provider value={theme}><script dangerouslySetInnerHTML={{__html:boot}}/><div ref={root} className={`${v.page} ${s.shell}`} data-identity-shell>
    <header className={`${v.header} ${s.header}`} data-v4-header>
      <button ref={button} className={`${v.menuButton} ${s.mobileToggle}`} aria-label={open?(en?'Close menu':'Fechar menu'):(en?'Open menu':'Abrir menu')} aria-expanded={open} aria-controls="identity-mobile-menu" onClick={()=>setOpen(!open)}><i/><i/><i/></button>
      <nav className={s.desktop} aria-label={en?'Main navigation':'Navegação principal'}>{links.map(link=><Link key={link.href} href={link.href} aria-current={path===link.href||path.startsWith(link.href+'/')?'page':undefined}>{link.label}</Link>)}</nav>
      <Link href={home} className={s.mascot} aria-label={en?'Jhow.ars — home':'Jhow.ars — início'}><JhowIsotype/></Link>
      <div className={v.controls}><Link href={languagePath('pt')} scroll={!isHome} onClick={()=>{if(isHome)dispatchEvent(new Event('identity-locale'));}} aria-current={!en?'page':undefined}>PT</Link><Link href={languagePath('en')} scroll={!isHome} onClick={()=>{if(isHome)dispatchEvent(new Event('identity-locale'));}} aria-current={en?'page':undefined}>EN</Link><button className={v.theme} onClick={theme.toggle} aria-pressed={theme.dark} aria-label={theme.dark?(en?'Switch to light theme':'Ativar tema claro'):(en?'Switch to dark theme':'Ativar tema escuro')}><span/></button></div>
      <div className={v.scrim} data-open={open} onClick={()=>{setOpen(false);button.current?.focus();}}/>
      <nav ref={nav} id="identity-mobile-menu" className={`${v.menu} ${s.mobileMenu}`} data-open={open} inert={!open} aria-label={en?'Mobile navigation':'Navegação mobile'}>{links.map(link=><Link key={link.href} href={link.href} aria-current={path===link.href||path.startsWith(link.href+'/')?'page':undefined} onClick={()=>setOpen(false)}>{link.label}</Link>)}</nav>
    </header>
    <main className={isHome?s.home:s.content}>{children}</main>
    <footer className={v.imprint} data-v4-footer><div className={v.imprintInner}>
      <Link className={v.isotype} href={home} aria-label={en?'Home':'Início'}><Image src="/brand/home-v4/isotipo.svg" width={556} height={598} alt=""/></Link>
      <a className={v.footerContact} href={`mailto:${settings?.email||'jhow@jhowars.com'}`}>{settings?.email||'jhow@jhowars.com'}</a>
      <span className={v.footerPlace}>{en?'Based in Brazil':'Brasil'}</span><span className={v.footerAvailability}>{en?'Available for collaborations, partnerships and creative projects':'Disponível para: colaborações, parcerias e projetos com identidade autoral'}</span>
      <nav className={v.footerSocial} aria-label={en?'Social media':'Redes sociais'}>{(['instagram','behance','linkedin'] as const).map(kind=>{const href=settings?.[kind]||fallbackSiteSettings[kind];return href?<a key={kind} href={href} target="_blank" rel="noopener noreferrer" aria-label={kind==='linkedin'?'LinkedIn':kind==='behance'?'Behance':'Instagram'}><SocialIcon kind={kind}/></a>:null;})}</nav><span className={v.footerCredit}>© 2026 Jhow.ars</span>
    </div></footer>
  </div></Theme.Provider>;
}
