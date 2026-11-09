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

const depthTravel = { far: 44, middle: 90, near: 140 };

export function useGalleryMotion(root: RefObject<HTMLDivElement | null>) {
  const recent = useRef(new Set<string>());
  const furthest = useRef(-1);
  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const surface = node;
    const quiet = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 900px)");
    const pointer = matchMedia("(hover:hover) and (pointer:fine)");
    let tiles: HTMLElement[] = [];
    let scenes: HTMLElement[] = [];
    let frame = 0;
    let pointerFrame = 0;

    function updateDepth() {
      frame = 0;
      if (quiet.matches) return;
      const viewport = innerHeight;
      const strength = compact.matches ? .28 : 1;
      // Measure the static figure, keeping its reveal, hover and previous
      // displacement out of the scroll calculation.
      const offsets = tiles.map(tile => {
        const rect = tile.getBoundingClientRect();
        const depth = tile.dataset.depth as keyof typeof depthTravel;
        const travel = Math.min(depthTravel[depth] * Math.min(1.16, viewport / 850), rect.height * .44);
        const progress = .5 - (rect.top + rect.height / 2) / viewport;
        return (Math.max(-.5, Math.min(.5, progress)) * travel * strength).toFixed(2) + "px";
      });
      tiles.forEach((tile, index) => {
        if (tile.style.getPropertyValue("--v4-depth") !== offsets[index]) {
          tile.style.setProperty("--v4-depth", offsets[index]);
        }
      });
    }

    function queueDepth() {
      if (!quiet.matches && !frame) frame = requestAnimationFrame(updateDepth);
    }

    function updateMouseDrift() {
      pointerFrame = 0;
      if (quiet.matches || compact.matches || !pointer.matches) return;
      const x = (lastPointer.x / Math.max(1, innerWidth) - .5) * 2;
      const y = (lastPointer.y / Math.max(1, innerHeight) - .5) * 2;
      for (const scene of scenes) {
        const depth = scene.closest<HTMLElement>("[data-depth]")?.dataset.depth;
        const travel = depth === "near" ? 15 : depth === "middle" ? 10 : 6;
        scene.style.setProperty("--v4-mouse-x", `${(-x * travel).toFixed(1)}px`);
        scene.style.setProperty("--v4-mouse-y", `${(-y * travel).toFixed(1)}px`);
      }
    }

    let lastPointer = { x: innerWidth / 2, y: innerHeight / 2 };
    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      lastPointer = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updateMouseDrift);
    }
    function clearMouseDrift() {
      for (const scene of scenes) {
        scene.style.setProperty("--v4-mouse-x", "0px");
        scene.style.setProperty("--v4-mouse-y", "0px");
      }
    }

    function motionPreferenceChanged() {
      if (quiet.matches) {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(pointerFrame);
        frame = 0;
        pointerFrame = 0;
        tiles.forEach(tile => tile.style.removeProperty("--v4-depth"));
        clearMouseDrift();
      } else {
        queueDepth();
        if (compact.matches || !pointer.matches) clearMouseDrift();
        else if (!pointerFrame) pointerFrame = requestAnimationFrame(updateMouseDrift);
      }
    }

    const io = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        const tile = target as HTMLElement;
        if (tile.hasAttribute("data-editorial")) {
          tile.toggleAttribute("data-in-view", isIntersecting);
          if (isIntersecting) tile.setAttribute("data-phrase-seen", "");
          continue;
        }
        if (!isIntersecting) continue;
        const index = Number(tile.closest<HTMLElement>("[data-leaf]")?.dataset.leaf);
        const key = `${index}:${tile.dataset.work}`;
        if (!quiet.matches && index >= furthest.current - 16 && !recent.current.has(key)) tile.dataset.printed = "true";
        recent.current.add(key);
        if (recent.current.size > 128) recent.current.delete(recent.current.values().next().value!);
        furthest.current = Math.max(furthest.current, index);
        io.unobserve(tile);
      }
    }, { rootMargin: "0px 0px 28px", threshold: .02 });
    const observed = new Set<Element>();
    function refresh() {
      for (const item of observed) {
        if (!surface.contains(item)) { io.unobserve(item); observed.delete(item); }
      }
      surface.querySelectorAll("[data-print],[data-editorial]").forEach(item => {
        if (observed.has(item)) return;
        observed.add(item);
        io.observe(item);
      });
      tiles = Array.from(surface.querySelectorAll<HTMLElement>("[data-depth]"));
      scenes = Array.from(surface.querySelectorAll<HTMLElement>("[data-scene-drift]"));
      queueDepth();
      if (!compact.matches && pointer.matches && !quiet.matches && !pointerFrame) pointerFrame = requestAnimationFrame(updateMouseDrift);
    }
    refresh();
    const changes = new MutationObserver(refresh);
    changes.observe(surface, { childList: true, subtree: true });
    addEventListener("scroll", queueDepth, { passive: true });
    addEventListener("resize", queueDepth);
    surface.addEventListener("pointermove", onPointerMove, { passive: true });
    surface.addEventListener("pointerleave", clearMouseDrift);
    quiet.addEventListener("change", motionPreferenceChanged);
    return () => {
      io.disconnect();
      changes.disconnect();
      removeEventListener("scroll", queueDepth);
      removeEventListener("resize", queueDepth);
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerleave", clearMouseDrift);
      quiet.removeEventListener("change", motionPreferenceChanged);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
    };
  }, [root]);
}
