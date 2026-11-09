import type { HomePost } from "@/lib/portfolio";
import { interventionFor, type EditorialPlacement } from "./editorial-plan";

export type Slot = [x: number, y: number, w: number, h: number];
const opening: Slot[] = [
  [0, 8, 21, 53], [25, 0, 18, 43], [62, 0, 17, 32], [82, 12, 18, 40],
  [10, 68, 23, 26], [36, 66, 13, 29], [52, 39, 22, 54], [77, 69, 23, 26],
];
const arrangements: Slot[][] = [
  [[0, 3, 31, 70], [36, 1, 29, 36], [70, 13, 30, 44], [39, 46, 29, 47]],
  [[0, 25, 60, 57], [64, 1, 23, 44], [77, 55, 23, 40], [0, 1, 30, 17]],
  [[4, 0, 27, 50], [64, 11, 35, 58], [34, 52, 28, 41], [1, 63, 26, 31]],
  [[0, 2, 30, 43], [34, 17, 32, 43], [71, 0, 29, 50], [8, 59, 23, 36]],
  [[7, 0, 48, 63], [67, 15, 33, 55], [27, 73, 37, 24], [0, 74, 23, 23]],
];

export const layoutFor = (index: number) => index < 0 ? -1 : index % arrangements.length;

export function ratioOf(post: HomePost) {
  const id = post.image?.match(/-(\d+)x(\d+)\.[a-z]+(?:$|\?)/i);
  const ratio = post.imageAspectRatio ?? (id ? Number(id[1]) / Number(id[2]) : undefined);
  return ratio && Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
}

export function curate(posts: HomePost[]) {
  const usable = posts.filter((p) => p.image);
  const first: HomePost[] = [];
  const identities = new Set<string>();
  for (const post of usable) {
    const key = post.artwork?._id || post.modalTitle || post.project?._id || post._id;
    if (identities.has(key)) continue;
    first.push(post);
    identities.add(key);
    if (first.length === opening.length) break;
  }
  const selected = new Set(first.map(p => p._id));
  for (const p of usable) {
    if (first.length >= opening.length) break;
    if (!selected.has(p._id)) { first.push(p); selected.add(p._id); }
  }
  return { first, rest: usable.filter(p => !selected.has(p._id)), all: usable };
}

export function planPanel(posts: HomePost[], index: number, compositionWidth = 1200, canvas = 800) {
  const layout = layoutFor(index);
  const template = layout < 0 ? opening : arrangements[layout];
  const mirror = index >= 0 && Math.floor(index / arrangements.length) % 2 === 1;
  const remaining = [...posts];
  const candidates = template.slice(0, posts.length).map((slot, i) => ({ slot, i }));
  if (index < 0) candidates.sort((a, b) => [0,6,1,2,3,4,5,7].indexOf(a.i) - [0,6,1,2,3,4,5,7].indexOf(b.i));
  const fitted = candidates.map(({ slot: [x, y, w, h], i }) => {
    const target = index < 0 ? [.73,.72,1,.78,1.28,.78,.66,1.95][i] : w / h * 1.65;
    const best = remaining.reduce((winner, p, j) => {
      const score = (item: HomePost, rank: number) => {
        const presence = item.sizeHint === "hero" || item.sizeHint === "large";
        return Math.abs(Math.log((ratioOf(item) ?? 1) / target)) + rank * .045 - (presence && w * h > 790 ? .26 : 0);
      };
      return score(p, j) < score(remaining[winner], winner) ? j : winner;
    }, 0);
    return { post: remaining.splice(best, 1)[0], slot: [mirror ? 100 - x - w : x, y, w, h] as Slot };
  });
  const ordered = fitted.sort((a, b) => a.slot[1] - b.slot[1] || a.slot[0] - b.slot[0]);
  const intervention = interventionFor(index, layout, mirror);
  // Resolve desktop placement against each real image and its caption. The
  // source templates provide the art direction; this pass provides collision
  // safety without turning the composition into a repeated card grid.
  const protectedAreas = index < 0 ? [{ x: compositionWidth * .245, right: compositionWidth * .545, top: canvas * .49, bottom: canvas * .49 + 92 }] : [];
  if (intervention) {
    const [accentX, accentY, accentWidth] = intervention.desktop;
    const accentTop = accentY * canvas / 100;
    const accentHeight = intervention.graphic ? (intervention.phrase ? 250 : 350) : 110;
    protectedAreas.push({ x: accentX * compositionWidth / 100, right: (accentX + accentWidth) * compositionWidth / 100, top: accentTop, bottom: accentTop + accentHeight });
  }
  const placed: Array<{ x: number; right: number; top: number; bottom: number }> = [...protectedAreas];
  const safeTiles = ordered.map((tile) => {
    const [sourceX, y, sourceW] = tile.slot;
    const w = Math.min(sourceW * 1.04, 100);
    const x = Math.min(sourceX, 100 - w);
    const left = x * compositionWidth / 100;
    const right = left + w * compositionWidth / 100;
    const imageHeight = w * compositionWidth / (100 * (ratioOf(tile.post) ?? 1));
    const captionLines = Math.ceil((nameOfForLayout(tile.post).length || 1) / Math.max(12, Math.floor((right - left) / 7))) + (tile.post.year || tile.post.artwork?.year || tile.post.project?.year ? 1 : 0);
    const blockHeight = imageHeight + 9 + captionLines * 18;
    let top = y * canvas / 100;
    let changed = true;
    while (changed) {
      changed = false;
      for (const block of placed) {
        const horizontal = left < block.right + 48 && right > block.x - 48;
        const vertical = top < block.bottom + 48 && top + blockHeight > block.top - 48;
        if (horizontal && vertical) {
          top = block.bottom + 48;
          changed = true;
        }
      }
    }
    placed.push({ x: left, right, top, bottom: top + blockHeight });
    return { ...tile, slot: [x, top, w, tile.slot[3]] as Slot };
  });
  let mobileY = index < 0 ? 4 : 2;
  let statementTop = 0;
  const tiles = ordered.map((tile, i) => {
    const ratio = ratioOf(tile.post) ?? 1;
    const spread = (i + Math.max(0, index)) % 5;
    const w = ratio > 1.35 ? [96, 84, 100, 90, 96][spread] : [61, 73, 54, 78, 64][spread];
    const width = Math.min(w, ratio * 124);
    const left = [0, 100 - width, (100 - width) * .25, 100 - width, (100 - width) * .7][spread];
    const top = mobileY;
    mobileY += width / ratio + [15, 16, 15, 17, 16][spread] + (index < 0 && i === 1 ? 23 : 0);
    if (i === 1) statementTop = mobileY - 24;
    if (index < 0 && ordered.length === 1) { statementTop = mobileY; mobileY += 26; }
    return { ...tile, ratio, mobile: [left, top, width] as const };
  });
  let editorial = null;
  if (intervention) {
    const minHeight = intervention.graphic && intervention.phrase ? 68 : 49;
    let mobile: EditorialPlacement | undefined;
    for (const tile of tiles) {
      const [left, top, width] = tile.mobile;
      const right = 100 - left - width;
      const space = Math.max(left, right);
      const imageHeight = width / tile.ratio;
      if (space < 32 || imageHeight < minHeight) continue;
      const accentWidth = Math.min(39, space - 6);
      const x = left > right ? (left - accentWidth) / 2 : left + width + (right - accentWidth) / 2;
      mobile = [x, top + Math.max(3, (imageHeight - minHeight) / 2), accentWidth];
      break;
    }
    if (!mobile) {
      mobile = [21, mobileY, 58];
      mobileY += intervention.graphic && intervention.phrase ? 42 : 31;
    }
    editorial = { ...intervention, desktop: [intervention.desktop[0], intervention.desktop[1] * canvas / 100, intervention.desktop[2]], mobile };
  }
  const composedTiles = safeTiles.map((tile, i) => ({
    ...tile,
    ratio: tiles[i].ratio,
    mobile: tiles[i].mobile,
  }));
  return { tiles: composedTiles, mobileHeight: mobileY, statementTop, editorial };
}

function nameOfForLayout(post: HomePost) {
  return post.modalTitle || post.artwork?.title || post.project?.title || post.internalName || "";
}

export function panelSource(posts: ReturnType<typeof curate>, index: number) {
  const size = posts.all.length;
  if (!size) return [];
  if (index < 0) return posts.first;
  const remainingPanels = Math.ceil(posts.rest.length / 4);
  if (index < remainingPanels) return posts.rest.slice(index * 4, index * 4 + 4);
  const panelsPerPass = Math.ceil(size / 4);
  const step = index - remainingPanels;
  const pass = Math.floor(step / panelsPerPass);
  const position = step % panelsPerPass;
  const start = Math.floor(position * size / panelsPerPass);
  const end = Math.floor((position + 1) * size / panelsPerPass);
  const head = Math.floor(size / panelsPerPass);
  const tail = Math.floor((panelsPerPass - 1) * size / panelsPerPass);
  const middle = tail - head;
  return Array.from({ length: end - start }, (_, i) => {
    const j = start + i;
    // Keep boundary groups disjoint; rotate interior works between editions.
    return posts.all[j >= head && j < tail ? head + (j - head + (pass % 3) * Math.ceil(middle / 3)) % middle : j];
  });
}
