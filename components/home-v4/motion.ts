"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const key = "jhow-v4-theme";
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useTheme(page: RefObject<HTMLDivElement | null>) {
  const [dark, setDark] = useState(false);
  const pulse = useRef<Animation | null>(null);
  const current = useRef(false);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let preference;
      try { preference = localStorage.getItem(key); } catch { /* Private browsing. */ }
      current.current = preference === "dark" || (preference !== "light" && media.matches);
      if (page.current) page.current.dataset.theme = current.current ? "dark" : "light";
      document.getElementById("v4-initial-theme")?.remove();
      setDark(current.current);
    };
    sync();
    media.addEventListener("change", sync);
    return () => { media.removeEventListener("change", sync); pulse.current?.cancel(); };
  }, [page]);
  function toggle() {
    const next = !current.current;
    current.current = next;
    const root = page.current;
    if (!root) return;
    root.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem(key, next ? "dark" : "light"); } catch { /* Keep the session choice. */ }
    setDark(next);
    pulse.current?.cancel();
    if (!reducedMotion()) pulse.current = root.querySelector("[data-theme-ink]")?.animate([
      { clipPath: "inset(0 0 0 100%)", opacity: .9 },
      { clipPath: "inset(0)", opacity: 0 },
    ], { duration: 430, easing: "cubic-bezier(.18,.75,.24,1)" }) ?? null;
  }
  return { dark, toggle };
}

export function usePrintReveal(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        const tile = target as HTMLElement;
        if (!reducedMotion() && tile.dataset.printed !== "true") tile.dataset.printed = "true";
        io.unobserve(tile);
      }
    }, { threshold: .14 });
    const observed = new Set<Element>();
    function refresh() {
      for (const item of observed) {
        if (!node!.contains(item)) { io.unobserve(item); observed.delete(item); }
      }
      node!.querySelectorAll("[data-print]").forEach(item => {
        if (observed.has(item)) return;
        observed.add(item);
        io.observe(item);
      });
    }
    refresh();
    const changes = new MutationObserver(refresh);
    changes.observe(node, { childList: true, subtree: true });
    return () => { io.disconnect(); changes.disconnect(); };
  }, [root]);
}
