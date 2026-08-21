"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArtworkMedia } from "@/components/artwork-media";
import { ProjectCardButton } from "@/components/project-card";
import type { Project } from "@/data/projects";

type FeaturedProject = { project:Project; image?:string; summary:string; number:number };

export function FeaturedProjects({items}:{items:FeaturedProject[]}){
  const [active,setActive]=useState<FeaturedProject|null>(null);
  const dialog=useRef<HTMLDivElement>(null);
  const opener=useRef<HTMLElement|null>(null);
  const close=()=>setActive(null);
  const open=(item:FeaturedProject)=>{ opener.current=document.activeElement as HTMLElement; setActive(item); };

  useEffect(()=>{
    if(!active) return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const focusable=()=>Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')??[]);
    const frame=requestAnimationFrame(()=>focusable()[0]?.focus());
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape") close();
      if(event.key==="Tab"){
        const nodes=focusable(); if(!nodes.length)return;
        const first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener("keydown",onKey);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener("keydown",onKey);document.body.style.overflow=previousOverflow;opener.current?.focus();};
  },[active]);

  return <>
    <div className="featured-grid">{items.map((item,index)=><ProjectCardButton key={item.project.slug} project={item.project} index={index} image={item.image} onOpen={()=>open(item)}/>)}</div>
    {active&&<div className="project-modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)close();}}>
      <div className="project-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="project-modal-title" aria-describedby="project-modal-summary">
        <button className="modal-close" type="button" onClick={close} aria-label="Fechar apresentação">×</button>
        <div className={`modal-image tone-${active.project.tone}`}><ArtworkMedia src={active.image} project={active.project.title} position="Home" orientation={active.project.orientation} alt={`Obra da série ${active.project.title}`} sizes="(max-width: 760px) 94vw, 60vw"/></div>
        <div className="modal-content">
          <p className="project-index">{String(active.number).padStart(2,"0")} / {String(items.length).padStart(2,"0")}</p>
          <h2 id="project-modal-title">{active.project.title}</h2>
          <p className="modal-meta">{active.project.year}<br/>{active.project.category}<br/>{active.project.technique}</p>
          <p id="project-modal-summary" className="modal-summary">{active.summary}</p>
          <Link href={`/work/${active.project.slug}`} className="modal-cta">Ver projeto completo <span>→</span></Link>
        </div>
      </div>
    </div>}
  </>;
}
