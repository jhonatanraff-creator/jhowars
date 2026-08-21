"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function MotionLayer() {
  const pathname = usePathname();
  const dot = useRef<HTMLDivElement>(null);
  const [cursorLabel, setCursorLabel] = useState("");

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observed=new WeakSet<Element>();
    const failSafeTimers=new Map<Element,ReturnType<typeof setTimeout>>();
    const show=(element:Element)=>{
      element.classList.add("is-visible");
      observer.unobserve(element);
      const timer=failSafeTimers.get(element);
      if(timer)clearTimeout(timer);
      failSafeTimers.delete(element);
    };
    const observeReveals=(root:ParentNode)=>root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element)=>{
      if(observed.has(element))return;
      observed.add(element);
      if(reduced)show(element);
      else{
        observer.observe(element);
        failSafeTimers.set(element,setTimeout(()=>show(element),1500));
      }
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) show(entry.target);
    }), { threshold: 0.08, rootMargin: "0px 0px -7%" });
    if (reduced) {
      observeReveals(document);
      return;
    }
    document.documentElement.classList.add("reveal-enabled");
    observeReveals(document);
    const mutationObserver=new MutationObserver(()=>observeReveals(document));
    mutationObserver.observe(document.body,{childList:true,subtree:true});

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
        element.style.setProperty("--parallax", `${Math.max(-12, Math.min(12, progress * -18))}px`);
      });
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(scrollY * .018, 6)}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateParallax); };
    updateParallax();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.documentElement.classList.remove("reveal-enabled");
      failSafeTimers.forEach(clearTimeout);
      observer.disconnect(); mutationObserver.disconnect(); removeEventListener("scroll", onScroll); cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -100, y = -100, targetX = x, targetY = y, animation = 0;
    const move = (event: MouseEvent) => { targetX = event.clientX; targetY = event.clientY; dot.current?.classList.add("cursor-visible"); };
    const render = () => {
      x += (targetX - x) * .18; y += (targetY - y) * .18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      animation = requestAnimationFrame(render);
    };
    const over = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const project = target.closest("[data-cursor-project]");
      const link = target.closest("a,button");
      setCursorLabel(project ? "VER ↗" : "");
      dot.current?.classList.toggle("cursor-project", Boolean(project));
      dot.current?.classList.toggle("cursor-link", Boolean(link && !project));
    };
    addEventListener("mousemove", move); document.addEventListener("mouseover", over); render();
    return () => { removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); cancelAnimationFrame(animation); };
  }, []);

  return <div ref={dot} className="custom-cursor" aria-hidden="true"><span>{cursorLabel}</span></div>;
}
