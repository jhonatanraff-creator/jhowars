export type PortfolioProject = {
  _id: string;
  _type: "project";
  title: string;
  slug: string;
  year?: number;
  category?: string;
  descriptionPt?: string;
  descriptionEn?: string;
  cover: string;
  featured: boolean;
};

export type PortfolioArtwork = {
  _id: string;
  _type: "artwork";
  title: string;
  image: string;
  alt: string;
  projectSlug: string;
  layout: "portrait" | "landscape" | "square";
};

// Verbatim project copy and exact local assets are sourced from docs/legacy.
export const fallbackProjects: PortfolioProject[] = [
  { _id: "project-veja", _type: "project", title: "VEJA SAÚDE — Editorial Illustration", slug: "veja-saude-editorial-illustration", year: 2026, category: "Editorial", descriptionPt: "Para a edição de setembro de 2026 da VEJA SAÚDE, criei uma série de ilustrações para diferentes seções da revista, passando por temas como pesquisas sobre a cura do HIV, menopausa e saúde mental, genética, risco cardiovascular, regulação e a nova geração de medicamentos para emagrecimento.\n\nOs assuntos mudavam de uma página para outra, mas o desafio era o mesmo: encontrar imagens que aproximassem temas complexos de saúde e ciência sem transformar tudo em uma explicação literal. Todo o trabalho foi desenvolvido dentro da paleta visual da edição, fazendo com que ilustrações tão diferentes ainda pertencessem ao mesmo universo.\n\nCada seção pedia um tipo diferente de imagem, mas todas precisavam conviver dentro da mesma revista. A paleta reduzida acabou virando o fio que conecta tudo, fazendo temas bem diferentes pertencerem à mesma edição.", descriptionEn: "For the September 2026 issue of VEJA SAÚDE, I created a series of illustrations for different sections of the magazine, moving through subjects such as HIV research, menopause and mental health, genetics, cardiovascular risk, regulation and the new generation of weight loss drugs.\n\nThe subjects changed from page to page, but the challenge was the same: finding images that could make complex health and science topics easier to approach without turning them into literal explanations. Everything was developed within the visual palette of the issue, bringing the illustrations together as one editorial universe.\n\nEach section asked for a different kind of image, but they all had to live together inside the same magazine. The limited palette became the thread between them, helping very different subjects feel like part of the same issue.", cover: "/legacy/veja-saude/cover.png", featured: true },
  { _id: "project-corpos", _type: "project", title: "Corpos Gráficos", slug: "corpos-graficos", cover: "/legacy/corpos-graficos/cover.png", featured: true },
  { _id: "project-bestas", _type: "project", title: "BESTAS DO DIA - Brazilian Wildlife", slug: "bestas-do-dia-brazilian-wildlife", category: "Ilustração / identidade visual", descriptionPt: "BESTAS DO DIA Uma coleção de animais brasileiros transformados em símbolos gráficos. Inspirado pela tensão entre arte popular, ilustração editorial, gravura e design gráfico contemporâneo, este projeto explora a força visual de três criaturas icônicas: a Onça-Pintada, o Tucano e a Garça. Mais do que representar a natureza de forma realista, cada animal se torna um sistema visual de formas, texturas, cores e símbolos. Cada ilustração foi desenvolvida como uma identidade própria, mantendo uma linguagem compartilhada de contraste, ritmo e imperfeição manual. BESTAS DO DIA é um exercício de transformar a fauna brasileira em presença gráfica.", descriptionEn: "BESTAS DO DIA is a collection of original illustrations inspired by Brazilian wildlife.\n\nThe project explores the visual power of three iconic animals — Jaguar, Toucan, and Heron — through a graphic language influenced by printmaking, editorial illustration, folk art, poster design, and contemporary visual culture.\n\nEach animal was developed as an independent visual identity, combining symbolic elements, handcrafted textures, bold colors, and geometric compositions. The collection investigates how nature can be transformed into graphic systems capable of existing across posters, books, packaging, objects, editorial applications, and visual identities.\n\nCreated by Jhow.ars.", cover: "/legacy/bestas-do-dia/cover.png", featured: true },
  { _id: "project-boi", _type: "project", title: "BUMBA MEU BOI", slug: "bumba-meu-boi", category: "Ilustração / risografia", descriptionPt: "BUMBA MEU BOI começou como um experimento em risografia.", descriptionEn: "The goal was never to recreate the traditional figure literally, but to translate its rhythm, color and movement into a contemporary graphic language.", cover: "/legacy/bumba-meu-boi/cover.png", featured: true },
  { _id: "project-fogo", _type: "project", title: "FOGO FÓSSIL - Selection of illustrations", slug: "fogo-fossil", category: "Ilustração / impressão", descriptionPt: "FOGO FÓSSIL é um projeto contemporâneo de ilustração brasileira inspirado em mitologia, simbolismos populares e tradições gráficas de impressão.\n\nA série combina ilustração, composição editorial e experimentação visual através de pôsteres, texturas, imagens de processo e aplicações fictícias.\n\nConstruído entre processos digitais e físicos, o projeto explora cores vibrantes, imperfeições artesanais e cultura visual latino-americana contemporânea.", descriptionEn: "FOGO FÓSSIL is a contemporary Brazilian illustration project inspired by mythology, folk symbolism and graphic print traditions.\n\nThe series combines illustration, editorial composition and visual experimentation through posters, textures, process imagery and fictional applications.\n\nBuilt between digital and physical processes, the project explores vibrant colors, handcrafted imperfections and contemporary Latin American visual culture.", cover: "/legacy/fogo-fossil/cover.png", featured: true },
  { _id: "project-posters", _type: "project", title: "Posters 2024 - Experimental Print and Illustration", slug: "posters-2024-experimental-print-and-illustration", year: 2024, category: "Impressão experimental e ilustração", cover: "/legacy/posters-2024/cover.jpg", featured: true },
  { _id: "project-oque-fica", _type: "project", title: "O Que Fica - Project Editorial", slug: "o-que-fica-project-editorial", category: "Projeto editorial / livro", descriptionEn: "O Que Fica is an experimental book that explores the connections between image, memory, and emotion. Using old photographs of the authors themselves, the project combines these images with poems and narratives that reflect the moments captured and the feelings associated with them. Each page is a graphic and editorial experimentation, aiming to bring new life to past memories through a poetic and visual lens. Produced in offset and in A4 format, the book merges visual art and literature, resulting in a unique and personal editorial experience.", cover: "/legacy/o-que-fica/cover.png", featured: true },
  { _id: "project-countenance", _type: "project", title: "Countenance - Selection of illustrations", slug: "countenance-illustration", category: "Ilustração digital", descriptionEn: "\"The existential crisis is one of the most frequent things in my life. I feel lost most of the time, this illustration shows me what it is like to live in the midst of the chaos of options and the answer not given\"", cover: "/legacy/countenance/cover.jpg", featured: true },
];

const coverArtworks: PortfolioArtwork[] = fallbackProjects.map((project, index) => ({
  _id: `artwork-${project.slug}`,
  _type: "artwork",
  title: project.title,
  image: project.cover,
  alt: project.title,
  projectSlug: project.slug,
  layout: index === 0 || index === 3 || index === 4 ? "landscape" : "portrait",
}));

export const fallbackArtworks: PortfolioArtwork[] = [
  ...coverArtworks,
  { _id: "artwork-posters-2024-02", _type: "artwork", title: "Posters 2024 - Experimental Print and Illustration", image: "/legacy/posters-2024/second.jpg", alt: "Posters 2024 - Experimental Print and Illustration", projectSlug: "posters-2024-experimental-print-and-illustration", layout: "portrait" },
  { _id: "artwork-countenance-02", _type: "artwork", title: "Countenance - Selection of illustrations", image: "/legacy/countenance/second.jpg", alt: "Countenance - Selection of illustrations", projectSlug: "countenance-illustration", layout: "portrait" },
];
