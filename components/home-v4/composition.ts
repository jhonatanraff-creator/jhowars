import type { HomePost } from "@/lib/portfolio";

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

export function planPanel(posts: HomePost[], index: number) {
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
  return { tiles, mobileHeight: mobileY, statementTop, layout, mirror };
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
