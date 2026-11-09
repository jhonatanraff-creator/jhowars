"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { type curate, type TextMeasure, panelSource, planPanel, panelAdvance } from "./composition";
import styles from "./home-v4.module.css";

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

export function useEditionWindow(catalog: ReturnType<typeof curate>, surface: RefObject<HTMLDivElement | null>, marker: RefObject<HTMLDivElement | null>, measure: RefObject<HTMLDivElement | null>, paused: boolean, en = false) {
  const [edition, setEdition] = useState(initial);
  const current = useRef(initial);
  const [metrics, setMetrics] = useState<{ width: number; canvas: number; mobile: boolean; panels: ReturnType<typeof planPanel>[]; opening: ReturnType<typeof planPanel> } | null>(null);
  const lastMetrics = useRef(metrics);
  const repetition = useMemo(() => {
    const before = Math.ceil(catalog.rest.length / 4);
    const pass = 3 * Math.ceil(catalog.all.length / 4);
    return { before, period: pass ? 10 * pass / gcd(10, pass) : 0 };
  }, [catalog]);
  const panelAt = useCallback((i: number) => {
    if (!metrics) return planPanel(panelSource(catalog, i), i, 1200, 800, undefined, en, false);
    if (i < 0) return metrics.opening;
    const canonical = i < repetition.before ? i : repetition.before + (i - repetition.before) % repetition.period;
    const panel = metrics.panels[canonical];
    return panel.editorial ? { ...panel, editorial: { ...panel.editorial, id: i + ":" + (panel.editorial.phrase?.id ?? panel.editorial.graphic) } } : panel;
  }, [catalog, en, metrics, repetition]);
  const plan = useMemo(() => {
    const before = Math.ceil(catalog.rest.length / 4);
    const pass = 3 * Math.ceil(catalog.all.length / 4);
    const period = pass ? 10 * pass / gcd(10, pass) : 0;
    return { before, period, panels: Array.from({ length: before + period }, (_, i) => panelAt(i)) };
  }, [catalog, panelAt]);

  const geometry = useMemo(() => {
    if (!metrics) return null;
    const offsets = [0];
    for (const [i, panel] of plan.panels.entries()) {
      const next = plan.panels[i + 1] ?? plan.panels[plan.before];
      offsets.push(offsets.at(-1)! + panelAdvance(panel, next, metrics.mobile));
    }
    return { before: plan.before, period: plan.period, offsets };
  }, [metrics, plan]);
  const previousGeometry = useRef<Geometry | null>(null);
  const resizeAnchor = useRef<{index:number; fraction:number} | null>(null);

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
    previousGeometry.current = geometry;
    const anchor = resizeAnchor.current;
    if (!geometry || !anchor) return;
    resizeAnchor.current = null;
    const offset = anchor.fraction * (within(geometry, anchor.index + 1) - within(geometry, anchor.index));
    const frame = requestAnimationFrame(() => restorePosition({index:anchor.index,offset}));
    return () => cancelAnimationFrame(frame);
  }, [geometry, restorePosition]);

  useEffect(() => {
    const root = surface.current;
    const probe = measure.current;
    if (!root || !probe) return;
    const breakpoint = matchMedia("(max-width: 900px)");
    let alive = true;
    function read(force = false) {
      const width = root!.getBoundingClientRect().width;
      const canvas = probe!.getBoundingClientRect().height;
      const mobile = breakpoint.matches;
      const old = lastMetrics.current;
      if (!alive || width <= 0 || canvas <= 0 || (!force && old?.width === width && old.canvas === canvas && old.mobile === mobile)) return;
      const oldGeometry = previousGeometry.current;
      if (oldGeometry && marker.current && scrollY > 100) {
        const logical = within(oldGeometry, current.current.base) - marker.current.getBoundingClientRect().top;
        if (logical > 0) {
          const index = locate(oldGeometry, logical);
          const length = within(oldGeometry,index+1) - within(oldGeometry,index);
          resizeAnchor.current = {index,fraction:(logical-within(oldGeometry,index))/Math.max(1,length)};
        }
      }
      const cache = new Map<string, number>();
      const text: TextMeasure = (kind, value, w, variant) => {
        const key = [kind, value, w.toFixed(2), variant].join("|");
        const saved = cache.get(key);
        if (saved !== undefined) return saved;
        const item = document.createElement(kind === "phrase" ? "p" : "div");
        item.className = kind === "caption" ? styles.caption : kind === "statement" ? styles.statement : styles.editorialPhrase;
        Object.assign(item.style, { width: w + "px", maxWidth: "none", position: "absolute", top: "0", left: "0", margin: "0" });
        if (variant) { const [scale, style] = variant.split(":"); item.dataset.scale = scale; item.dataset.style = style; }
        for (const [i, line] of value.split("\n").entries()) {
          const part = document.createElement(kind === "caption" && i > 0 ? "em" : "span");
          part.style.display = "block"; part.textContent = line; item.append(part);
        }
        probe!.append(item);
        const height = Math.ceil(item.getBoundingClientRect().height);
        item.remove();
        cache.set(key, height);
        return height;
      };
      // DOM measurement stays in this effect. Render and scroll only consume
      // the cached plans; no per-frame layout measurement or DOM writes.
      const panels = Array.from({length:repetition.before + repetition.period}, (_, i) => planPanel(panelSource(catalog, i), i, width, canvas, text, en, mobile));
      const opening = planPanel(catalog.first, -1, width, canvas, text, en, mobile);
      lastMetrics.current = { width, canvas, mobile, panels, opening };
      setMetrics(lastMetrics.current);
    }
    const observer = new ResizeObserver(() => read());
    observer.observe(root);
    observer.observe(probe);
    const changed = () => read(true);
    breakpoint.addEventListener("change", changed);
    read();
    void document.fonts.ready.then(() => read(true));
    return () => { alive = false; observer.disconnect(); breakpoint.removeEventListener("change", changed); };
  }, [catalog, en, marker, measure, repetition, surface]);

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
    heightAt: (i: number) => i < 0 ? metrics && metrics.panels[0] ? panelAdvance(metrics.opening, metrics.panels[0], metrics.mobile) : metrics?.opening.height : geometry ? within(geometry, i + 1) - within(geometry, i) : undefined,
    panelAt,
  };
}
