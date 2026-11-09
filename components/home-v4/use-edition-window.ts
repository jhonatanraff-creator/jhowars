"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { type curate, panelSource, planPanel } from "./composition";

const initial = { base: 0, start: 0, end: 4, spacer: 0, runway: 0 };
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

type Geometry = { before: number; period: number; offsets: number[] };
const within = (g: Geometry, index: number) => {
  if (index <= g.before || !g.period) return g.offsets[Math.min(index, g.before)];
  const relative = index - g.before;
  const pass = g.offsets[g.before + g.period] - g.offsets[g.before];
  return g.offsets[g.before + relative % g.period] + Math.floor(relative / g.period) * pass;
};

function locate(g: Geometry, offset: number) {
  if (offset <= 0) return 0;
  let lower = 0;
  let upper = g.before;
  let cycles = 0;
  if (g.period && offset >= g.offsets[g.before]) {
    const pass = g.offsets[g.before + g.period] - g.offsets[g.before];
    cycles = Math.floor((offset - g.offsets[g.before]) / pass);
    offset -= cycles * pass;
    lower = g.before;
    upper += g.period;
  }
  while (lower < upper) {
    const pivot = Math.ceil((lower + upper) / 2);
    if (g.offsets[pivot] <= offset) lower = pivot;
    else upper = pivot - 1;
  }
  return cycles * g.period + lower;
}

function height(panel: ReturnType<typeof planPanel>, width: number, canvas: number, mobile: boolean) {
  if (mobile) return Math.round(panel.mobileHeight * width / 100);
  const bottom = Math.max(0, ...panel.tiles.map(({ slot: [, y, w], ratio, post }) => {
    const imageHeight = w * width / (100 * ratio);
    const title = post.modalTitle || post.artwork?.title || post.project?.title || post.internalName || "";
    const captionLines = Math.ceil(title.length / Math.max(12, Math.floor((w * width / 100) / 7))) + (post.year || post.artwork?.year || post.project?.year ? 1 : 0);
    return y + imageHeight + 9 + captionLines * 18;
  }));
  // Leave room for captions at the seam without padding the entire composition.
  const accentBottom = panel.editorial
    ? panel.editorial.desktop[1] + (panel.editorial.graphic ? (panel.editorial.phrase ? 250 : 350) : 110)
    : 0;
  return Math.ceil(Math.max(bottom + 43, accentBottom));
}

export function useEditionWindow(catalog: ReturnType<typeof curate>, surface: RefObject<HTMLDivElement | null>, marker: RefObject<HTMLDivElement | null>, measure: RefObject<HTMLDivElement | null>, paused: boolean) {
  const [edition, setEdition] = useState(initial);
  const current = useRef(initial);
  const [metrics, setMetrics] = useState<{ width: number; canvas: number; mobile: boolean } | null>(null);
  const lastMetrics = useRef(metrics);
  const plan = useMemo(() => {
    const before = Math.ceil(catalog.rest.length / 4);
    const pass = 3 * Math.ceil(catalog.all.length / 4);
    const period = pass ? 10 * pass / gcd(10, pass) : 0;
    const width = metrics?.width ?? 1200;
    const canvas = metrics?.canvas ?? 800;
    return { before, period, panels: Array.from({ length: before + period }, (_, i) => planPanel(panelSource(catalog, i), i, width, canvas)) };
  }, [catalog, metrics]);

  const geometry = useMemo(() => {
    if (!metrics) return null;
    const offsets = [0];
    for (const panel of plan.panels) offsets.push(offsets.at(-1)! + height(panel, metrics.width, metrics.canvas, metrics.mobile));
    return { before: plan.before, period: plan.period, offsets };
  }, [metrics, plan]);

  const capturePosition = useCallback(() => {
    const root = marker.current;
    const g = geometry;
    if (!root || !g) return null;
    const logicalOffset = within(g, current.current.base) - root.getBoundingClientRect().top;
    const index = locate(g, logicalOffset);
    return { index, offset: logicalOffset - within(g, index) };
  }, [geometry, marker]);

  const restorePosition = useCallback((anchor: { index: number; offset: number }) => {
    const root = marker.current;
    const g = geometry;
    if (!root || !g) return false;
    const index = Math.max(0, anchor.index);
    const logicalOffset = within(g, index) + anchor.offset;
    const base = Math.max(0, index - 24);
    const from = Math.max(base, index - 2);
    const until = Math.max(base + 4, locate(g, logicalOffset + innerHeight) + 5);
    const next = {
      base,
      start: from,
      end: until,
      spacer: within(g, from) - within(g, base),
      runway: Math.ceil(innerHeight * 5),
    };
    current.current = next;
    flushSync(() => setEdition(next));
    const markerY = scrollY + root.getBoundingClientRect().top;
    globalThis.scrollTo({
      top: markerY + logicalOffset - within(g, base),
      behavior: "instant",
    });
    return true;
  }, [geometry, marker]);

  useEffect(() => {
    const root = surface.current;
    const probe = measure.current;
    if (!root || !probe) return;
    const breakpoint = matchMedia("(max-width: 900px)");
    function read() {
      const width = root!.getBoundingClientRect().width;
      const canvas = probe!.getBoundingClientRect().height;
      const mobile = breakpoint.matches;
      const old = lastMetrics.current;
      if (width <= 0 || canvas <= 0 || (old?.width === width && old.canvas === canvas && old.mobile === mobile)) return;
      lastMetrics.current = { width, canvas, mobile };
      setMetrics(lastMetrics.current);
    }
    const observer = new ResizeObserver(read);
    observer.observe(root);
    observer.observe(probe);
    breakpoint.addEventListener("change", read);
    read();
    return () => { observer.disconnect(); breakpoint.removeEventListener("change", read); };
  }, [measure, surface]);

  useEffect(() => {
    const start = marker.current;
    if (!start || !geometry?.period || paused) return;
    const g = geometry;
    let frame = 0;
    function update() {
      frame = 0;
      const old = current.current;
      const physicalTop = -start!.getBoundingClientRect().top;
      const origin = within(g, old.base);
      const offset = origin + physicalTop;
      const first = locate(g, offset);
      const last = locate(g, offset + innerHeight);
      // Keep the physical scroll range finite. Move the origin with the
      // visible composition as an anchor, including when moving backwards.
      const base = first - old.base >= 48 ? first - 24
        : old.base > 0 && first - old.base <= 4 ? Math.max(0, old.base - 24) : old.base;
      const from = Math.max(base, first - 2);
      const until = Math.max(base + 4, last + 5);
      const spacer = within(g, from) - within(g, base);
      const runway = Math.ceil(innerHeight * 5);
      if (old.base === base && old.start === from && old.end === until && old.spacer === spacer && old.runway === runway) return;
      const next = { base, start: from, end: until, spacer, runway };
      current.current = next;
      if (base !== old.base || first >= old.end || first < old.start) {
        flushSync(() => setEdition(next));
        if (base !== old.base) {
          const markerY = scrollY + start!.getBoundingClientRect().top;
          window.scrollTo({ top: markerY + offset - within(g, base), behavior: "instant" });
        }
      } else {
        setEdition(next);
      }
    }
    function queue() { if (!frame) frame = requestAnimationFrame(update); }
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    queue();
    return () => { removeEventListener("scroll", queue); removeEventListener("resize", queue); cancelAnimationFrame(frame); };
  }, [geometry, marker, paused]);

  const toTop = useCallback(() => {
    if (current.current.base) {
      current.current = initial;
      flushSync(() => setEdition(initial));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return {
    ...edition,
    capturePosition,
    restorePosition,
    toTop,
    heightAt: (i: number) => geometry ? within(geometry, i + 1) - within(geometry, i) : undefined,
    width: metrics?.width ?? 1200,
    canvas: metrics?.canvas ?? 800,
    openingHeight: metrics ? height(planPanel(catalog.first, -1, metrics.width, metrics.canvas), metrics.width, metrics.canvas, metrics.mobile) : undefined,
  };
}
