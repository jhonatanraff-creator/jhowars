export type MediaOrientation = "portrait" | "landscape" | "square" | "wide" | "tall";

export type ProjectImage = {
  src?: string;
  orientation: MediaOrientation;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  technique: string;
  description: string;
  cover: string;
  images: ProjectImage[];
  featured?: boolean;
  orientation: MediaOrientation;
  layout: "wide" | "offset" | "compact";
  tone: "red" | "blue" | "earth" | "ink" | "yellow" | "green";
};

export const projects: Project[] = [
  {
    slug: "fogo-fossil",
    title: "Fogo Fóssil",
    category: "Pintura & pesquisa visual",
    year: "2025",
    technique: "Técnica mista sobre tela",
    description:
      "Fogo Fóssil investiga memórias minerais, calor e permanência. Camadas de cor e matéria constroem paisagens que oscilam entre vestígio arqueológico e imagem em combustão.",
    cover: "/art/fogo-fossil/cover.jpg",
    images: [{ src: "/art/fogo-fossil/01.jpg", orientation: "portrait" }, { src: "/art/fogo-fossil/02.jpg", orientation: "landscape" }],
    featured: true,
    orientation: "landscape",
    layout: "wide",
    tone: "red",
  },
  {
    slug: "bestas-do-dia",
    title: "Bestas do Dia",
    category: "Ilustração",
    year: "2024",
    technique: "Nanquim e pigmento sobre papel",
    description:
      "Uma coleção de criaturas cotidianas, desenhadas como registros de um bestiário afetivo. Gestos rápidos encontram formas densas e fabulares.",
    cover: "/art/bestas-do-dia/cover.jpg",
    images: [{ src: "/art/bestas-do-dia/01.jpg", orientation: "tall" }, { src: "/art/bestas-do-dia/02.jpg", orientation: "landscape" }],
    featured: true,
    orientation: "portrait",
    layout: "offset",
    tone: "blue",
  },
  {
    slug: "paisagem-do-sitio",
    title: "Paisagem do Sítio",
    category: "Desenho & pintura",
    year: "2024",
    technique: "Pastel oleoso e acrílica",
    description:
      "A paisagem rural reaparece como lembrança fragmentada. Horizonte, vegetação e arquitetura se reorganizam em campos de cor e ritmos gráficos.",
    cover: "/art/paisagem-do-sitio/cover.jpg",
    images: [{ src: "/art/paisagem-do-sitio/01.jpg", orientation: "wide" }, { src: "/art/paisagem-do-sitio/02.jpg", orientation: "portrait" }],
    featured: true,
    orientation: "landscape",
    layout: "compact",
    tone: "earth",
  },
  {
    slug: "serigrafias",
    title: "Serigrafias",
    category: "Impressos",
    year: "2023—25",
    technique: "Serigrafia artesanal",
    description:
      "Edições gráficas em pequenas tiragens exploram repetição, falha, sobreposição e a materialidade direta da tinta impressa.",
    cover: "/art/serigrafias/cover.jpg",
    images: [{ src: "/art/serigrafias/01.jpg", orientation: "portrait" }, { src: "/art/serigrafias/02.jpg", orientation: "square" }],
    featured: true,
    orientation: "portrait",
    layout: "offset",
    tone: "ink",
  },
  {
    slug: "corpos-graficos",
    title: "Corpos Gráficos",
    category: "Identidade visual",
    year: "2023",
    technique: "Direção de arte e design gráfico",
    description:
      "Sistema visual que aproxima anatomia, letra e gesto. As peças trabalham o corpo como superfície de inscrição e movimento.",
    cover: "/art/corpos-graficos/cover.jpg",
    images: [{ src: "/art/corpos-graficos/01.jpg", orientation: "wide" }, { src: "/art/corpos-graficos/02.jpg", orientation: "portrait" }],
    orientation: "landscape",
    layout: "wide",
    tone: "yellow",
  },
  {
    slug: "minota",
    title: "Minota",
    category: "Objeto & ilustração",
    year: "2022",
    technique: "Cerâmica, desenho e publicação",
    description:
      "Minota nasce do encontro entre mito e matéria. Uma personagem atravessa objetos, desenhos e páginas, mudando de escala e linguagem.",
    cover: "/art/minota/cover.jpg",
    images: [{ src: "/art/minota/01.jpg", orientation: "square" }, { src: "/art/minota/02.jpg", orientation: "tall" }],
    orientation: "square",
    layout: "compact",
    tone: "green",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
