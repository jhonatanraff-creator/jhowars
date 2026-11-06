export type EditorialGraphic = "rectangles" | "star" | "eye" | "dots";
export type Phrase = {
  id: string;
  text: string;
  en: string;
  align: "start" | "center" | "end";
  scale: "small" | "medium" | "large";
  style: "regular" | "bold" | "italic";
  motion: "line" | "words" | "lift";
};

const phrases: readonly Phrase[] = [
  { id: "humano", text: "De gente pra gente.", en: "From people, for people.", align: "start", scale: "medium", style: "regular", motion: "line" },
  { id: "estranho", text: "Tudo aqui é quase sério.", en: "Everything here is almost serious.", align: "end", scale: "small", style: "italic", motion: "words" },
  { id: "afetivo", text: "O estranho também é de casa.", en: "Strange feels at home here, too.", align: "start", scale: "medium", style: "italic", motion: "lift" },
  { id: "cotidiano", text: "Não repara a bagunça.", en: "Don't mind the mess.", align: "start", scale: "small", style: "regular", motion: "words" },
  { id: "surreal", text: "Todo mundo é meio alguém.", en: "Everyone is somebody, more or less.", align: "center", scale: "large", style: "italic", motion: "line" },
  { id: "irreverente", text: "Nem tudo precisa fazer sentido.", en: "Not everything has to make sense.", align: "start", scale: "medium", style: "bold", motion: "lift" },
  { id: "brasileiro", text: "Aparece lá em casa qualquer dia.", en: "Drop by sometime.", align: "end", scale: "small", style: "regular", motion: "words" },
  { id: "contraditorio", text: "Parece mentira, mas acontece.", en: "Sounds made up, but it happens.", align: "start", scale: "medium", style: "italic", motion: "line" },
  { id: "inesperado", text: "Hoje o mundo acordou esquisito.", en: "The world woke up weird today.", align: "center", scale: "large", style: "regular", motion: "words" },
  { id: "despretensioso", text: "Qualquer coisa a gente conversa.", en: "We can talk about it anytime.", align: "start", scale: "medium", style: "italic", motion: "lift" },
];

type Intervention = { phrase?: Phrase; graphic?: EditorialGraphic };
export type EditorialPlacement = readonly [x: number, y: number, width: number];

// The artwork geometry repeats on a multiple of 30 panels. Leave unlisted
// panels to the artworks and keep interventions on that same geometry cycle.
const program: Partial<Record<number, Intervention>> = {
  0: { phrase: phrases[0], graphic: "rectangles" },
  2: { phrase: phrases[1] },
  4: { graphic: "star" },
  5: { phrase: phrases[2] },
  7: { phrase: phrases[3], graphic: "eye" },
  9: { phrase: phrases[4] },
  11: { graphic: "dots" },
  12: { phrase: phrases[5] },
  14: { phrase: phrases[6] },
  16: { phrase: phrases[7] },
  18: { phrase: phrases[8] },
  21: { phrase: phrases[9] },
};

const pockets: EditorialPlacement[] = [
  [2, 79, 33], [33, 2, 27], [34, 13, 27], [36, 69, 35], [67, 78, 32],
];

export function interventionFor(index: number, layout: number, mirror: boolean) {
  if (index < 0) return null;
  const content = program[index % 30];
  if (!content) return null;
  const [x, y, width] = pockets[layout];
  return {
    ...content,
    id: `${index}:${content.phrase?.id ?? content.graphic}`,
    desktop: [mirror ? 100 - x - width : x, y, width] as EditorialPlacement,
  };
}
