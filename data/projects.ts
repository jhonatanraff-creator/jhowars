export type MediaOrientation = "portrait" | "landscape" | "square" | "wide" | "tall";

export type ProjectImage = { src: string; orientation: MediaOrientation };

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  technique: string;
  description: string;
  artFolder: string;
  contentPath: string;
  cover?: string;
  images: ProjectImage[];
  homeImages?: string[];
  featured?: boolean;
  orientation: MediaOrientation;
  layout: "wide" | "offset" | "compact";
  tone: "red" | "blue" | "earth" | "ink" | "yellow" | "green";
};

export const projects: Project[] = [
  { slug:"fogo-fossil", title:"Fogo Fóssil", category:"Pintura & pesquisa visual", year:"2025", technique:"Técnica mista sobre tela", description:"Fogo Fóssil investiga memórias minerais, calor e permanência. Camadas de cor e matéria constroem paisagens que oscilam entre vestígio arqueológico e imagem em combustão.", artFolder:"fogo_fossil", contentPath:"/art/fogo_fossil/content.md", images:[], featured:true, orientation:"landscape", layout:"wide", tone:"red" },
  { slug:"bestas-do-dia", title:"Bestas do Dia", category:"Ilustração", year:"2024", technique:"Nanquim e pigmento sobre papel", description:"Uma coleção de criaturas cotidianas, desenhadas como registros de um bestiário afetivo. Gestos rápidos encontram formas densas e fabulares.", artFolder:"bestas_do_dia___brazilian_wildlife", contentPath:"/art/bestas_do_dia___brazilian_wildlife/content.md", images:[], featured:true, orientation:"portrait", layout:"offset", tone:"blue" },
  { slug:"corpos-graficos", title:"Corpos Gráficos", category:"Identidade visual", year:"2023", technique:"Direção de arte e design gráfico", description:"Sistema visual que aproxima anatomia, letra e gesto. As peças trabalham o corpo como superfície de inscrição e movimento.", artFolder:"corpos_graficos", contentPath:"/art/corpos_graficos/content.md", images:[], featured:true, orientation:"landscape", layout:"wide", tone:"yellow" },
  { slug:"countenance", title:"Countenance", category:"Digital illustration", year:"—", technique:"Digital illustration", description:"The existential crisis is one of the most frequent things in my life. I feel lost most of the time, this illustration shows me what it is like to live in the midst of the chaos of options and the answer not given", artFolder:"countenance___illustration", contentPath:"/art/countenance___illustration/content.md", images:[], featured:true, orientation:"portrait", layout:"compact", tone:"earth" },
  { slug:"o-que-fica", title:"O Que Fica", category:"Editorial Project", year:"—", technique:"Editorial design", description:"“O Que Fica” is an editorial project that embarks on a journey of visual and conceptual exploration. This A4 format book merges form, color, and idea, transforming it into a true art object.", artFolder:"o_que_fica___project_editorial", contentPath:"/art/o_que_fica___project_editorial/content.md", images:[], featured:true, orientation:"landscape", layout:"offset", tone:"ink" },
  { slug:"posters-2024", title:"Posters 2024", category:"Handcrafted Print Collection", year:"2024", technique:"Offset press and screen printing", description:"“Poster 2024” (also known as “Poster Vol 1”) is a curated series of handcrafted prints, created using traditional manual techniques such as offset press and screen printing.", artFolder:"posters_2024___experimental_print_and_illustration", contentPath:"/art/posters_2024___experimental_print_and_illustration/content.md", images:[], featured:true, orientation:"portrait", layout:"compact", tone:"green" },
];

export function getProject(slug:string){ return projects.find((project)=>project.slug===slug); }
export function getNextProject(slug:string){ const index=projects.findIndex((project)=>project.slug===slug); return projects[(index+1)%projects.length]; }
