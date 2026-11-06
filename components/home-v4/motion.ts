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
      { clipPath: "inset(0 0 0 100%)", opacity: .35 },
      { clipPath: "inset(0)", opacity: 0 },
    ], { duration: 360, easing: "cubic-bezier(.18,.75,.24,1)" }) ?? null;
  }
  return { dark, toggle };
}

export function usePrintReveal(root: RefObject<HTMLDivElement | null>) {
  const recent = useRef(new Set<string>());
  const furthest = useRef(-1);
  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        const tile = target as HTMLElement;
        const index = Number(tile.closest<HTMLElement>("[data-leaf]")?.dataset.leaf);
        const key = `${index}:${tile.dataset.work}`;
        if (!reducedMotion() && index >= furthest.current - 16 && !recent.current.has(key)) tile.dataset.printed = "true";
        recent.current.add(key);
        if (recent.current.size > 128) recent.current.delete(recent.current.values().next().value!);
        furthest.current = Math.max(furthest.current, index);
        io.unobserve(tile);
      }
    }, { rootMargin: "0px 0px 28px", threshold: .02 });
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
