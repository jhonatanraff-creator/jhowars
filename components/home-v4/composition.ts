import type { HomePost } from "@/lib/portfolio";

export type Slot = [x: number, y: number, w: number, h: number];
const opening: Slot[] = [
  [0, 10, 18.5, 48], [25.3, 0, 15, 40], [62.3, 0, 14, 27], [82.3, 14, 14.7, 36],
  [12, 70, 19, 27], [37, 67, 11, 29], [52.7, 38, 18.5, 53], [78.5, 72, 21.5, 22],
];
const arrangements: Slot[][] = [
  [[2, 5, 27, 63], [39, 2, 23, 30], [72, 19, 26, 40], [41, 52, 30, 42], [0, 77, 22, 17]],
  [[1, 24, 56, 51], [66, 3, 17, 37], [79, 55, 19, 39], [0, 2, 24, 15], [40, 1, 17, 16]],
  [[7, 1, 23, 47], [66, 14, 31, 56], [32, 57, 29, 34], [0, 65, 22, 27], [72, 79, 23, 16]],
  [[0, 4, 27, 38], [32, 21, 30, 40], [73, 1, 24, 43], [8, 57, 21, 35], [64, 66, 34, 27]],
  [[12, 1, 43, 61], [69, 22, 29, 51], [27, 72, 31, 24], [0, 72, 22, 23], [79, 81, 20, 14]],
];

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
  const template = index < 0 ? opening : arrangements[index % arrangements.length];
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
    return { post: remaining.splice(best, 1)[0], slot: [mirror ? 100 - x - w : x, y, w, h] as Slot, ink: (Math.max(0, index) + i) % 3 };
  });
  const ordered = fitted.sort((a, b) => a.slot[1] - b.slot[1] || a.slot[0] - b.slot[0]);
  let mobileY = index < 0 ? 5 : 4;
  let statementTop = 0;
  const tiles = ordered.map((tile, i) => {
    const ratio = ratioOf(tile.post) ?? 1;
    const spread = (i + Math.max(0, index)) % 5;
    const w = ratio > 1.35 ? [90, 76, 96, 83, 92][spread] : [52, 64, 45, 70, 56][spread];
    const width = Math.min(w, ratio * 116);
    const left = [0, 100 - width, (100 - width) * .25, 100 - width, (100 - width) * .7][spread];
    const top = mobileY;
    mobileY += width / ratio + [14, 20, 13, 25, 16][spread] + (index < 0 && i === 1 ? 28 : 0);
    if (i === 1) statementTop = mobileY - 30;
    if (index < 0 && ordered.length === 1) { statementTop = mobileY; mobileY += 26; }
    return { ...tile, ratio, mobile: [left, top, width] as const };
  });
  return { tiles, mobileHeight: mobileY, statementTop };
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
