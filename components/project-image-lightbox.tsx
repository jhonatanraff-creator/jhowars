"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";

type LightboxItem = { src: string; alt: string; caption: string };
type Point = { x: number; y: number };

export function ProjectImageLightbox({ children, closeLabel, zoomInLabel, zoomOutLabel, resetLabel, imageLabel, previousLabel, nextLabel }: { children: ReactNode; closeLabel: string; zoomInLabel: string; zoomOutLabel: string; resetLabel: string; imageLabel: string; previousLabel: string; nextLabel: string }) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const scopeRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const dragStart = useRef<{ pointer: number; point: Point; origin: Point } | null>(null);
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

  const close = useCallback(() => {
    setActiveIndex(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    pointers.current.clear();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const show = (index: number) => {
    const buttons = Array.from(scopeRef.current?.querySelectorAll<HTMLElement>("[data-project-lightbox-image]") || []);
    const nextItems = buttons.map((button) => ({
      src: button.dataset.lightboxSrc || "",
      alt: button.dataset.lightboxAlt || "",
      caption: button.dataset.lightboxCaption || "",
    })).filter((item) => item.src);
    const target = buttons[index];
    triggerRef.current = target || null;
    setItems(nextItems);
    setActiveIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-project-lightbox-image]");
    if (!target || !scopeRef.current?.contains(target)) return;
    event.preventDefault();
    const buttons = Array.from(scopeRef.current.querySelectorAll<HTMLElement>("[data-project-lightbox-image]"));
    show(buttons.indexOf(target));
  };
  const active = activeIndex == null ? null : items[activeIndex] || null;

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "ArrowLeft" && items.length > 1) { event.preventDefault(); setActiveIndex((index) => (index! + items.length - 1) % items.length); setZoom(1); setOffset({ x: 0, y: 0 }); }
      if (event.key === "ArrowRight" && items.length > 1) { event.preventDefault(); setActiveIndex((index) => (index! + 1) % items.length); setZoom(1); setOffset({ x: 0, y: 0 }); }
      if (event.key === "Tab") {
        const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]') || []);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
  }, [activeIndex, items.length, close]);

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };
  const changeZoom = (delta: number) => setZoom((value) => Math.min(4, Math.max(1, Number((value + delta).toFixed(2)))));
  const clampOffset = (point: Point, scale = zoom): Point => {
    const viewer = viewerRef.current, image = imageRef.current;
    if (!viewer || !image) return point;
    const maxX = Math.max(0, (image.clientWidth * scale - viewer.clientWidth) / 2);
    const maxY = Math.max(0, (image.clientHeight * scale - viewer.clientHeight) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, point.x)), y: Math.max(-maxY, Math.min(maxY, point.y)) };
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) dragStart.current = { pointer: event.pointerId, point: { x: event.clientX, y: event.clientY }, origin: offset };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      dragStart.current = null;
    }
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const nextZoom = Math.max(1, Math.min(4, pinchStart.current.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinchStart.current.distance));
      setZoom(nextZoom);
      setOffset((point) => clampOffset(point, nextZoom));
    } else if (dragStart.current && (zoom > 1 || event.pointerType === "touch")) {
      const start = dragStart.current;
      setOffset(clampOffset({ x: start.origin.x + event.clientX - start.point.x, y: start.origin.y + event.clientY - start.point.y }));
    }
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    const remaining = [...pointers.current.entries()][0];
    if (remaining && zoom > 1) dragStart.current = { pointer: remaining[0], point: remaining[1], origin: offset };
    else dragStart.current = null;
  };

  return <div className="project-lightbox-scope" ref={scopeRef} onClick={handleClick}>
    {children}
    {active && <div className="project-lightbox-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="project-lightbox-dialog" role="dialog" aria-modal="true" aria-label={active.alt || imageLabel} tabIndex={-1} ref={dialogRef}>
        <button type="button" className="project-lightbox-close" aria-label={closeLabel} onClick={close}>×</button>
        <div className="project-lightbox-controls">
          <button type="button" aria-label={zoomOutLabel} onClick={() => changeZoom(-0.5)} disabled={zoom <= 1}>−</button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label={zoomInLabel} onClick={() => changeZoom(0.5)} disabled={zoom >= 4}>+</button>
          <button type="button" aria-label={resetLabel} onClick={reset}>↺</button>
        </div>
        {items.length > 1 && <>
          <button type="button" className="project-lightbox-prev" aria-label={previousLabel} onClick={() => { setActiveIndex((activeIndex! + items.length - 1) % items.length); reset(); }}>←</button>
          <button type="button" className="project-lightbox-next" aria-label={nextLabel} onClick={() => { setActiveIndex((activeIndex! + 1) % items.length); reset(); }}>→</button>
        </>}
        <div className="project-lightbox-viewer" ref={viewerRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={() => zoom > 1 ? reset() : setZoom(2)}>
          {/* Direct Sanity CDN URL preserves the original asset resolution for zoom. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imageRef} src={active.src} alt={active.alt} draggable={false} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, cursor: zoom > 1 ? "grab" : "zoom-in" }} />
        </div>
        {active.caption && <p className="project-lightbox-caption">{active.caption}</p>}
        {items.length > 1 && <span className="project-lightbox-count">{activeIndex! + 1} / {items.length}</span>}
      </div>
    </div>}
  </div>;
}
