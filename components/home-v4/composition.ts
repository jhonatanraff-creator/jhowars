import type { HomePost } from "@/lib/portfolio";
import { interventionFor } from "./editorial-plan";

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


export type Box = { x: number; y: number; width: number; height: number };
export type EditorialPlan = NonNullable<ReturnType<typeof interventionFor>> & { box: Box; graphicWidth: number; graphicHeight: number; protectedBox: Box };
export type TextMeasure = (kind: "caption" | "statement" | "phrase", text: string, width: number, variant?: string) => number;
export const workName = (post: HomePost) => post.modalTitle || post.artwork?.title || post.project?.title || post.internalName || "";
export const workYear = (post: HomePost) => post.year || post.artwork?.year || post.project?.year;
export const statementText = (en: boolean) => en ? "Artist, illustrator, printmaker,\nquestioner, etc." : "Artista, ilustrador, impressor,\nquestionador, etc.";

// Cropping windows include the full extent of the internal animations. The
// original SVG viewBoxes and geometry remain intact inside these windows.
export const graphicBounds = {
  rectangles: [16, 12, 182, 88],
  star: [60, 47, 59, 60],
  eye: [31, 28, 107, 119],
  dots: [36, 38, 114, 84],
} as const;

export function overlaps(a: Box, b: Box, gap = 0) {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

function place(width: number, height: number, desiredX: number, desiredY: number, surfaceWidth: number, placed: Box[], gap: number, anchor?: Box): Box {
  const right = Math.max(0, surfaceWidth - width);
  const xs = new Set([0, right, Math.max(0, Math.min(right, desiredX))]);
  for (let col = 0; col <= 24; col++) xs.add(right * col / 24);
  const ys = new Set([16, Math.max(16, desiredY)]);
  for (const box of placed) {
    ys.add(box.y); ys.add(box.y + box.height + gap);
    ys.add(Math.max(16, box.y + box.height / 2 - height / 2));
    xs.add(Math.max(0, Math.min(right, box.x - width - gap)));
    xs.add(Math.max(0, Math.min(right, box.x + box.width + gap)));
  }
  const currentBottom = Math.max(0, ...placed.map(b => b.y + b.height));
  let best: Box | undefined;
  let score = Infinity;
  for (const x of xs) for (const y of ys) {
    const box = { x, y, width, height };
    if (placed.some(other => overlaps(box, other, gap))) continue;
    // Evaluate visual mass in horizontal regions over this item's vertical
    // span, rather than rewarding only the shortest overall panel.
    const regions = [0, 1, 2].map(region => {
      const left = region * surfaceWidth / 3;
      const right = left + surfaceWidth / 3;
      return [...placed, box].reduce((area, item) => area +
        Math.max(0, Math.min(right, item.x + item.width) - Math.max(left, item.x)) *
        Math.max(0, Math.min(y + height, item.y + item.height) - Math.max(y, item.y)), 0);
    });
    const imbalance = (Math.max(...regions) - Math.min(...regions)) / Math.max(1, height);
    const distance = anchor ? Math.hypot(
      Math.max(0, anchor.x - x - width, x - anchor.x - anchor.width),
      Math.max(0, anchor.y - y - height, y - anchor.y - anchor.height),
    ) : 0;
    const cost = Math.max(currentBottom, y + height) * .76 + y * .18 +
      Math.abs(x - desiredX) * .24 + Math.abs(y - desiredY) * .12 + imbalance * .38 + distance * 1.5;
    if (cost < score) { score = cost; best = box; }
  }
  // A bottom candidate always exists, including for a very long CMS title.
  return best ?? { x: Math.min(right, desiredX), y: currentBottom + gap, width, height };
}

export function planPanel(posts: HomePost[], index: number, compositionWidth = 1200, canvas = 800, measure?: TextMeasure, en = false, compact = compositionWidth <= 820) {
  const layout = layoutFor(index);
  const template = layout < 0 ? opening : arrangements[layout];
  const mirror = index >= 0 && Math.floor(index / arrangements.length) % 2 === 1;
  const narrow = compositionWidth < 600;
  const gap = compact ? 28 : 48;
  const placed: Box[] = [];
  const textHeight: TextMeasure = measure ?? ((kind, text, w) => {
    const font = kind === "caption" ? 15 : kind === "statement" ? 24 : 23;
    return text.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length * font * .56 / w)) * font * 1.25, kind === "caption" ? 9 : 0);
  });
  let statement: Box | null = null;
  if (index < 0 && !compact) {
    const w = compositionWidth * .27;
    statement = { x: compositionWidth * .345, y: Math.min(canvas * .29, 230), width: w, height: textHeight("statement", statementText(en), w) };
    placed.push({ x: statement.x - 12, y: statement.y - 12, width: w + 24, height: statement.height + 24 });
  }
  const intervention = interventionFor(index, layout, mirror);
  let editorial: EditorialPlan | null = null;
  const remaining = [...posts];
  const tiles: Array<{ post: HomePost; ratio: number; box: Box; protectedBox: Box; motion: { scroll: number; mouse: number }; scale: string }> = [];

  function addEditorial() {
    if (!intervention) return;
    const width = compact ? Math.min(compositionWidth * .72, 320) : Math.min(compositionWidth * .27, 360);
    const nominal = { rectangles: 330, star: 245, eye: 235, dots: 300 };
    const graphicWidth = intervention.graphic ? Math.min(width, nominal[intervention.graphic] * (compact ? .75 : 1)) : 0;
    const bounds = intervention.graphic ? graphicBounds[intervention.graphic] : null;
    const graphicHeight = bounds ? graphicWidth * bounds[3] / bounds[2] : 0;
    const phrase = intervention.phrase;
    const phraseHeight = phrase ? textHeight("phrase", en ? phrase.en : phrase.text, width, phrase.scale + ":" + phrase.style) : 0;
    const height = graphicHeight + phraseHeight + (graphicHeight && phraseHeight ? 22 : 0);
    // A phrase belongs to a nearby visual group, while retaining its own
    // semantic identity. Prefer a smaller work, not an arbitrary panel floor.
    const anchor = tiles.length ? tiles.reduce((a, b) => a.box.width * a.box.height < b.box.width * b.box.height ? a : b).protectedBox : undefined;
    const x = anchor ? anchor.x + anchor.width + gap : compositionWidth * .45;
    const desiredY = anchor ? anchor.y + (anchor.height - height) / 2 : 16;
    const protectedBox = place(width + 12, height + 24, x, desiredY, compositionWidth, placed, gap, anchor);
    placed.push(protectedBox);
    editorial = { ...intervention, box: { x: protectedBox.x + 6, y: protectedBox.y + 12, width, height }, graphicWidth, graphicHeight, protectedBox };
  }

  for (let i = 0; i < Math.min(posts.length, template.length); i++) {
    if (index < 0 && compact && i === 2) {
      const w = Math.min(compositionWidth * .82, 500);
      const h = textHeight("statement", statementText(en), w);
      const box = place(w, h + 16, (compositionWidth - w) * .6, Math.max(...placed.map(b => b.y + b.height)) + gap, compositionWidth, placed, gap);
      statement = { ...box, y: box.y + 8, height: h };
      placed.push(box);
    }
    const source = template[i];
    const target = index < 0 ? [.73, .72, 1, .78, 1.28, .78, .66, 1.95][i] : source[2] / source[3] * 1.65;
    const best = remaining.reduce((winner, post, j) => Math.abs(Math.log((ratioOf(post) ?? 1) / target)) + j * .04 <
      Math.abs(Math.log((ratioOf(remaining[winner]) ?? 1) / target)) + winner * .04 ? j : winner, 0);
    const post = remaining.splice(best, 1)[0];
    const ratio = ratioOf(post) ?? 1;
    const featured = index >= 0 && index % 10 === 4 && i === 0;
    const scale = featured ? "protagonist" : i % 4 === 3 ? "small" : i % 2 === 0 ? "principal" : "complementary";
    const fraction = index < 0 ? [.225, .185, .205, .185, .24, .19, .235, .24][i] :
      featured ? .43 : scale === "principal" ? .295 : scale === "complementary" ? .245 : .205;
    const mobileFraction = narrow ? (ratio > 1.3 ? [.94,.86,.98][i % 3] : [.73,.86,.68,.8][(i + Math.max(index,0)) % 4]) : [.43,.38,.47,.4][i % 4];
    const maxHeight = compact ? (narrow ? Math.max(260, Math.min(canvas * .88, compositionWidth * 1.35)) : canvas * .68) : canvas * (featured ? .86 : index < 0 ? .57 : .7);
    const areaLimit = compositionWidth * canvas * (compact ? (narrow ? .55 : .24) : featured ? .27 : index < 0 ? .13 : .18);
    const width = Math.max(1, Math.min(compositionWidth - 32, compositionWidth * (compact ? mobileFraction : fraction), maxHeight * ratio, Math.sqrt(areaLimit * ratio)));
    const imageHeight = width / ratio;
    const caption = workName(post) + (workYear(post) ? "\n" + workYear(post) : "");
    const captionHeight = textHeight("caption", caption, width);
    const depth = (i + Math.max(0,index)) % 3;
    const scroll = (compact ? [18,28,40] : [30,50,74])[depth];
    const mouse = compact ? 0 : [5,8,12][depth];
    // Includes scroll's +/- half range, inverse pointer, reveal, hover and
    // the caption's 3px focus emphasis. The full image and caption move together.
    const dx = mouse + 4;
    const dy = scroll / 2 + mouse + 18;
    const desiredX = (mirror ? 100 - source[0] - source[2] : source[0]) / 100 * compositionWidth;
    const desiredY = narrow ? Math.max(16, ...placed.map(b => b.y + b.height)) + (placed.length ? gap : 0) : source[1] / 100 * canvas * .65;
    const protectedBox = place(width + dx * 2, imageHeight + captionHeight + dy * 2, desiredX - dx, desiredY, compositionWidth, placed, gap);
    placed.push(protectedBox);
    tiles.push({ post, ratio, scale, motion: { scroll, mouse }, protectedBox,
      box: { x: protectedBox.x + dx, y: protectedBox.y + dy, width, height: imageHeight + captionHeight } });
  }
  if (intervention && !editorial) addEditorial();
  if (index < 0 && compact && !statement) {
    const w = compositionWidth * .82;
    const h = textHeight("statement", statementText(en), w);
    statement = place(w, h, 0, Math.max(16, ...placed.map(b => b.y + b.height)) + gap, compositionWidth, placed, gap);
    placed.push(statement);
  }
  return { tiles, statement, editorial: editorial as EditorialPlan | null, height: Math.ceil(Math.max(0, ...placed.map(b => b.y + b.height)) + (compact ? 24 : 32)) };
}

export function panelBoxes(panel: ReturnType<typeof planPanel>): Box[] {
  return [...panel.tiles.map(tile => tile.protectedBox), ...(panel.editorial ? [panel.editorial.protectedBox] : []), ...(panel.statement ? [panel.statement] : [])];
}

// Neighbouring compositions interlock only where their full motion envelopes
// allow it. The overlap cap also keeps non-neighbouring panels disjoint, so
// periodic virtualization can retain its existing bounded, deterministic cache.
export function panelAdvance(current: ReturnType<typeof planPanel>, next: ReturnType<typeof planPanel>, compact = false) {
  const a = panelBoxes(current), b = panelBoxes(next);
  if (!a.length || !b.length) return current.height;
  const gap = compact ? 28 : 48;
  const minimum = current.height - Math.min(current.height, next.height) * .35;
  let advance = minimum;
  for (const first of a) for (const second of b) {
    if (first.x < second.x + second.width + gap && first.x + first.width + gap > second.x) {
      advance = Math.max(advance, first.y + first.height + gap - second.y);
    }
  }
  return Math.ceil(advance);
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
