export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  technique: string;
  description: string;
  cover: string;
  images: string[];
  featured?: boolean;
  orientation: "portrait" | "landscape" | "square";
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
    cover: "/art/fogo-fossil.svg",
    images: ["/art/fogo-fossil.svg", "/art/fogo-fossil-2.svg", "/art/fogo-fossil-3.svg"],
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
    cover: "/art/bestas-do-dia.svg",
    images: ["/art/bestas-do-dia.svg", "/art/bestas-do-dia-2.svg"],
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
    cover: "/art/paisagem-do-sitio.svg",
    images: ["/art/paisagem-do-sitio.svg", "/art/paisagem-do-sitio-2.svg"],
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
    cover: "/art/serigrafias.svg",
    images: ["/art/serigrafias.svg", "/art/serigrafias-2.svg"],
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
    cover: "/art/corpos-graficos.svg",
    images: ["/art/corpos-graficos.svg", "/art/corpos-graficos-2.svg"],
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
    cover: "/art/minota.svg",
    images: ["/art/minota.svg", "/art/minota-2.svg"],
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
