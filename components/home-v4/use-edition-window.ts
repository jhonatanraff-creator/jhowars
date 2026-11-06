"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { type curate, panelSource, planPanel } from "./composition";

const firstWindow = { start: 0, end: 4 };
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

export function useEditionWindow(catalog: ReturnType<typeof curate>, surface: RefObject<HTMLDivElement | null>, marker: RefObject<HTMLDivElement | null>, measure: RefObject<HTMLDivElement | null>, paused: boolean) {
  const [window, setWindow] = useState(firstWindow);
  const geometry = useMemo(() => {
    const before = Math.ceil(catalog.rest.length / 4);
    const pass = Math.ceil(catalog.all.length / 4);
    const period = pass ? 10 * pass / gcd(10, pass) : 0;
    const heights = [0];
    for (let i = 0; i < before + period; i++) {
      heights.push(heights[i] + planPanel(panelSource(catalog, i), i).mobileHeight);
    }
    return { before, period, heights };
  }, [catalog]);

  const mobileUnits = (i: number) => {
    const { before, period, heights } = geometry;
    if (!period || i <= before) return heights[Math.min(i, heights.length - 1)];
    const count = i - before;
    return heights[before + (count % period)] + Math.floor(count / period) * (heights[before + period] - heights[before]);
  };

  useEffect(() => {
    const start = marker.current;
    const probe = measure.current;
    const root = surface.current;
    if (!start || !probe || !root || paused || !catalog.all.length) return;
    let frame = 0;
    let pixels = probe.getBoundingClientRect().height;
    let width = root.getBoundingClientRect().width;
    const breakpoint = matchMedia("(max-width: 900px)");

    function locate(offset: number) {
      if (offset <= 0) return 0;
      if (!breakpoint.matches) return Math.floor(offset / Math.max(1, pixels));
      const units = offset * 100 / Math.max(1, width);
      const { before, period, heights } = geometry;
      let base = 0;
      let lower = 0;
      let upper = before;
      let target = units;
      if (units >= heights[before] && period) {
        const height = heights[before + period] - heights[before];
        const cycles = Math.floor((units - heights[before]) / height);
        base = cycles * period;
        target -= cycles * height;
        lower = before;
        upper = before + period;
      }
      while (lower < upper) {
        const pivot = Math.floor((lower + upper + 1) / 2);
        if (heights[pivot] <= target) lower = pivot;
        else upper = pivot - 1;
      }
      return base + lower;
    }

    function update() {
      frame = 0;
      const top = -start!.getBoundingClientRect().top;
      const first = locate(top);
      const last = locate(top + innerHeight);
      const from = Math.max(0, first - 2);
      const until = Math.max(4, last + (top > 0 ? 5 : 4));
      setWindow(old => old.start === from && old.end === until ? old : { start: from, end: until });
    }

    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(() => {
      pixels = probe.getBoundingClientRect().height;
      width = root.getBoundingClientRect().width;
      queue();
    });
    resize.observe(root);
    resize.observe(probe);
    addEventListener("scroll", queue, { passive: true });
    breakpoint.addEventListener("change", queue);
    queue();
    return () => {
      resize.disconnect();
      removeEventListener("scroll", queue);
      breakpoint.removeEventListener("change", queue);
      cancelAnimationFrame(frame);
    };
  }, [catalog, geometry, marker, measure, paused, surface]);

  return { ...window, mobileUnits: mobileUnits(window.start) };
}
