import { defineField, defineType } from "sanity";

const localizedString = defineType({ name: "localizedString", title: "Texto localizado", type: "object", fields: [
  defineField({ name: "pt", title: "Português", type: "string" }),
  defineField({ name: "en", title: "English", type: "string" }),
] });
const localizedText = defineType({ name: "localizedText", title: "Texto longo localizado", type: "object", fields: [
  defineField({ name: "pt", title: "Português", type: "text", rows: 8 }),
  defineField({ name: "en", title: "English", type: "text", rows: 8 }),
] });
const hoverBackgroundOptions = [{ title: "Azul", value: "#2856A6" }, { title: "Vermelho", value: "#E72C25" }, { title: "Amarelo", value: "#FFC400" }, { title: "Magenta", value: "#ED3E83" }, { title: "Laranja", value: "#F36B21" }, { title: "Preto", value: "#111111" }, { title: "Branco", value: "#FFFFFF" }, { title: "Custom", value: "custom" }];
const hoverTextOptions = [{ title: "Preto", value: "#111111" }, { title: "Branco", value: "#FFFFFF" }, { title: "Vermelho", value: "#E72C25" }, { title: "Azul", value: "#2856A6" }, { title: "Amarelo", value: "#FFC400" }, { title: "Magenta", value: "#ED3E83" }, { title: "Custom", value: "custom" }];

const imageEntry = defineType({
  name: "imageEntry", title: "Imagem de galeria", type: "object",
  fields: [
    defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "alt", title: "Texto alternativo", type: "localizedString" }),
    defineField({ name: "caption", title: "Legenda", type: "localizedString" }),
  ],
  preview: { select: { title: "caption.pt", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Imagem sem legenda", media }) },
});

const textBlock = defineType({ name: "textBlock", title: "Texto", type: "object", fields: [
  defineField({ name: "heading", title: "Título (opcional)", type: "localizedString" }),
  defineField({ name: "body", title: "Texto", type: "localizedText", validation: (r) => r.required() }),
  defineField({ name: "widthStyle", title: "Largura do texto", type: "string", description: "Controla a largura editorial do texto sem alterar sua sequência.", options: { list: ["small", "medium", "large", "full"] }, initialValue: "medium" }),
  defineField({ name: "alignment", title: "Alinhamento", type: "string", options: { list: ["left", "center", "right"] }, initialValue: "center" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const imageBlock = defineType({ name: "imageBlock", title: "Imagem", type: "object", fields: [
  defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
  defineField({ name: "alt", title: "Texto alternativo", type: "localizedString" }), defineField({ name: "caption", title: "Legenda", type: "localizedString" }),
  defineField({ name: "widthStyle", title: "Largura", type: "string", options: { list: ["small", "medium", "large", "full"] }, initialValue: "full" }),
  defineField({ name: "alignment", title: "Alinhamento", type: "string", options: { list: ["left", "center", "right"] }, initialValue: "center" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const galleryBlock = defineType({ name: "galleryBlock", title: "Galeria / coleção de mídia", type: "object", fields: [
  defineField({ name: "images", title: "Imagens (reordenáveis)", type: "array", of: [{ type: "imageEntry" }], validation: (r) => r.min(1) }),
  defineField({ name: "layout", title: "Composição", type: "string", description: "Mantém estas imagens como um único módulo editorial.", options: { list: [{ title: "Grade", value: "grid" }, { title: "Linha", value: "row" }, { title: "Empilhadas", value: "stack" }] }, initialValue: "grid" }),
  defineField({ name: "columnsDesktop", title: "Colunas — desktop", type: "number", options: { list: [2, 3, 4, 5] }, initialValue: 3 }),
  defineField({ name: "columnsTablet", title: "Colunas — tablet", type: "number", options: { list: [1, 2, 3, 4] }, initialValue: 2 }),
  defineField({ name: "columnsMobile", title: "Colunas — mobile", type: "number", options: { list: [1, 2] }, initialValue: 1 }),
  defineField({ name: "gap", title: "Espaço entre imagens", type: "string", options: { list: ["small", "medium", "large"] }, initialValue: "small" }),
  defineField({ name: "widthStyle", title: "Largura do grupo", type: "string", options: { list: ["small", "medium", "large", "full"] }, initialValue: "full" }),
  defineField({ name: "alignment", title: "Alinhamento", type: "string", options: { list: ["left", "center", "right"] }, initialValue: "center" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const twoImagesBlock = defineType({ name: "twoImagesBlock", title: "Duas imagens", type: "object", fields: [
  ...["leftImage", "rightImage"].map((name) => defineField({ name, title: name === "leftImage" ? "Imagem esquerda" : "Imagem direita", type: "image", options: { hotspot: true }, validation: (r) => r.required() })),
  ...["leftAlt", "rightAlt", "leftCaption", "rightCaption"].map((name) => defineField({ name, title: name, type: "localizedString" })),
  defineField({ name: "widthStyle", title: "Largura", type: "string", options: { list: ["small", "medium", "large", "full"] }, initialValue: "full" }),
  defineField({ name: "alignment", title: "Alinhamento", type: "string", options: { list: ["left", "center", "right"] }, initialValue: "center" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const fullWidthImageBlock = defineType({ name: "fullWidthImageBlock", title: "Imagem largura total", type: "object", fields: [
  defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }), defineField({ name: "alt", title: "Texto alternativo", type: "localizedString" }), defineField({ name: "caption", title: "Legenda", type: "localizedString" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const mediaBlock = defineType({ name: "mediaBlock", title: "Mídia (GIF/vídeo)", type: "object", fields: [
  defineField({ name: "media", title: "Arquivo", type: "file" }), defineField({ name: "externalUrl", title: "URL externa, se o arquivo não estiver disponível", type: "url" }), defineField({ name: "alt", title: "Texto alternativo", type: "localizedString" }), defineField({ name: "caption", title: "Legenda", type: "localizedString" }),
  defineField({ name: "widthStyle", title: "Largura", type: "string", options: { list: ["small", "medium", "large", "full"] }, initialValue: "full" }),
  defineField({ name: "alignment", title: "Alinhamento", type: "string", options: { list: ["left", "center", "right"] }, initialValue: "center" }),
  defineField({ name: "spacingTop", title: "Espaço antes", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
  defineField({ name: "spacingBottom", title: "Espaço depois", type: "string", options: { list: ["none", "small", "medium", "large"] }, initialValue: "medium" }),
] });
const captionBlock = defineType({ name: "captionBlock", title: "Legenda", type: "object", fields: [defineField({ name: "body", title: "Legenda", type: "localizedText" })] });
const spacerBlock = defineType({ name: "spacerBlock", title: "Espaçador", type: "object", fields: [defineField({ name: "size", title: "Tamanho", type: "string", options: { list: ["small", "medium", "large"] }, initialValue: "medium" })] });
const circulationItem = defineType({ name: "circulationItem", title: "Item de circulação", type: "object", fields: [
  defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }), defineField({ name: "organization", title: "Organização", type: "string" }), defineField({ name: "city", title: "Cidade", type: "string" }), defineField({ name: "state", title: "Estado", type: "string" }), defineField({ name: "years", title: "Anos confirmados", type: "array", of: [{ type: "number" }] }), defineField({ name: "description", title: "Descrição", type: "localizedText" }), defineField({ name: "link", title: "Link", type: "url" }),
], preview: { select: { title: "name", subtitle: "city" } } });

const project = defineType({
  name: "project", title: "Projeto", type: "document",
  orderings: [{ title: "Ordem do arquivo", name: "archiveOrder", by: [{ field: "archiveOrder", direction: "asc" }] }, { title: "Ano (mais recente)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }, { title: "Título", name: "titleAsc", by: [{ field: "title.pt", direction: "asc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "localizedString", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "category", title: "Categoria", type: "localizedString" }),
    defineField({ name: "archiveOrder", title: "Ordem no arquivo", type: "number", description: "Número menor aparece antes no índice de Projetos. Em branco, o projeto fica após os itens ordenados." }),
    defineField({ name: "showInProjects", title: "Mostrar no índice de Projetos", type: "boolean", initialValue: true, description: "Desative para ocultar do índice sem apagar o projeto ou sua página interna." }),
    defineField({ name: "contentLayout", title: "Apresentação do conteúdo", type: "string", description: "Use sequência editorial para páginas cujos contentBlocks reproduzem a ordem modular do material legado. Padrão mantém o cabeçalho e a capa do layout atual.", options: { list: [{ title: "Padrão do site", value: "standard" }, { title: "Sequência editorial", value: "editorial-sequence" }] }, initialValue: "standard" }),
    defineField({ name: "coverImage", title: "Capa", type: "image", options: { hotspot: true } }),
    defineField({ name: "summary", title: "Resumo legado", type: "localizedText" }), defineField({ name: "client", title: "Cliente", type: "localizedString" }),
    defineField({ name: "credits", title: "Créditos", type: "localizedText" }), defineField({ name: "legacyUrl", title: "URL antiga", type: "url" }),
    defineField({ name: "artworks", title: "Obras relacionadas", type: "array", of: [{ type: "reference", to: [{ type: "artwork" }] }] }),
    defineField({ name: "relatedProjects", title: "Outros projetos (até 3)", type: "array", description: "Seleção manual que aparece depois deste projeto. Se ficar vazia, o site usa os próximos projetos visíveis em ordem do arquivo.", of: [{ type: "reference", to: [{ type: "project" }] }], validation: (r) => r.max(3).unique().custom((items, context) => {
      const ownId = String(context.document?._id || "").replace(/^drafts\./, "");
      return ((items || []) as Array<{ _ref?: string }>).some((item) => String(item?._ref || "").replace(/^drafts\./, "") === ownId) ? "Um projeto não pode recomendar a si mesmo." : true;
    }) }),
    defineField({ name: "contentBlocks", title: "Conteúdo do projeto", type: "array", of: [{ type: "textBlock" }, { type: "imageBlock" }, { type: "galleryBlock" }, { type: "twoImagesBlock" }, { type: "fullWidthImageBlock" }, { type: "mediaBlock" }, { type: "captionBlock" }, { type: "spacerBlock" }] }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "legacyLayoutFingerprint", title: "Controle da sequência legada", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title.pt", subtitle: "category.pt", media: "coverImage", year: "year" }, prepare: ({ title, subtitle, media, year }) => ({ title: title || "Projeto sem título", subtitle: [subtitle, year].filter(Boolean).join(" · "), media }) },
});

const artwork = defineType({
  name: "artwork", title: "Obra", type: "document",
  orderings: [{ title: "Título", name: "titleAsc", by: [{ field: "title.pt", direction: "asc" }] }, { title: "Ano (mais recente)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "localizedString", validation: (r) => r.required() }), defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title.pt" } }),
    defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "technique", title: "Técnica", type: "localizedString" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "localizedString" }),
    defineField({ name: "description", title: "Descrição", type: "localizedText" }), defineField({ name: "images", title: "Imagens", type: "array", of: [{ type: "imageEntry" }] }),
    defineField({ name: "coverImage", title: "Capa", type: "image", options: { hotspot: true } }), defineField({ name: "categories", title: "Categorias", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: [{ title: "Arquivo", value: "archive" }, { title: "Disponível", value: "available" }, { title: "Esgotada", value: "sold-out" }, { title: "Não está à venda", value: "not-for-sale" }] }, initialValue: "archive" }),
    defineField({ name: "project", title: "Projeto", type: "reference", to: [{ type: "project" }] }), defineField({ name: "legacyUrl", title: "URL antiga", type: "url" }), defineField({ name: "altText", title: "Texto alternativo", type: "localizedString" }), defineField({ name: "notes", title: "Notas editoriais", type: "text" }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title.pt", year: "year", status: "status", media: "coverImage" }, prepare: ({ title, year, status, media }) => ({ title: title || "Obra sem título", subtitle: [year, status].filter(Boolean).join(" · "), media }) },
});

const homePost = defineType({
  name: "homePost", title: "Publicação da Home", type: "document",
  fields: [
    defineField({ name: "internalName", title: "Nome interno", type: "string", validation: (r) => r.required() }), defineField({ name: "enabled", title: "Ativa na Home", type: "boolean", initialValue: false }),
    defineField({ name: "image", title: "Imagem da Home", type: "image", options: { hotspot: true }, validation: (r) => r.required() }), defineField({ name: "mobileImage", title: "Imagem para mobile (opcional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "orientation", title: "Orientação", type: "string", description: "Não altera a proporção da imagem. Apenas informa ao layout como tratá-la.", options: { list: ["auto", "portrait", "landscape", "square"] }, initialValue: "auto" }),
    defineField({ name: "sizeHint", title: "Presença visual", type: "string", description: "Indica a presença visual desejada. A posição final continua sendo definida pela composição automática da Home.", options: { list: ["auto", "small", "medium", "large", "hero"] }, initialValue: "auto" }),
    defineField({ name: "artwork", title: "Obra relacionada", type: "reference", to: [{ type: "artwork" }] }), defineField({ name: "project", title: "Projeto relacionado", type: "reference", to: [{ type: "project" }] }),
    defineField({ name: "modalTitle", title: "Título no modal", type: "localizedString" }), defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "technique", title: "Técnica", type: "localizedString" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "localizedString" }),
    defineField({ name: "description", title: "Descrição", type: "localizedText" }), defineField({ name: "modalGallery", title: "Imagens deste modal", type: "array", of: [{ type: "imageEntry" }] }), defineField({ name: "altText", title: "Texto alternativo", type: "localizedString" }),
    defineField({ name: "weight", title: "Frequência relativa (opcional)", type: "number", description: "Peso usado apenas para frequência em uma seleção aleatória; não define posição ou ordem." }),
    defineField({ name: "hoverBackgroundColor", title: "COR DO FUNDO NO HOVER", type: "string", description: "Cor exibida atrás da obra quando o cursor passa sobre este post na Home.", options: { list: hoverBackgroundOptions }, validation: (r) => r.required() }),
    defineField({ name: "hoverBackgroundCustom", title: "Cor de fundo customizada", type: "string", description: "Use hexadecimal no formato #RRGGBB.", hidden: ({ parent }) => parent?.hoverBackgroundColor !== "custom", validation: (r) => r.custom((value, context) => (context.parent as Record<string, unknown> | undefined)?.hoverBackgroundColor !== "custom" || (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) || "Informe uma cor hexadecimal obrigatória no formato #RRGGBB.") }),
    defineField({ name: "hoverTextColor", title: "COR DO TEXTO NO HOVER", type: "string", description: "Cor do título grande exibido durante o estado hover.", options: { list: hoverTextOptions }, validation: (r) => r.required() }),
    defineField({ name: "hoverTextCustom", title: "Cor do texto customizada", type: "string", description: "Use hexadecimal no formato #RRGGBB.", hidden: ({ parent }) => parent?.hoverTextColor !== "custom", validation: (r) => r.custom((value, context) => (context.parent as Record<string, unknown> | undefined)?.hoverTextColor !== "custom" || (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) || "Informe uma cor hexadecimal obrigatória no formato #RRGGBB.") }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "internalName", subtitle: "project.title.pt", media: "image", enabled: "enabled", background: "hoverBackgroundColor", text: "hoverTextColor" }, prepare: ({ title, subtitle, media, enabled, background, text }) => ({ title: `${enabled ? "●" : "○"} ${title || "Publicação sem nome"}`, subtitle: `${subtitle || "Sem projeto relacionado"} · fundo ${background || "não definido"} · texto ${text || "não definido"}`, media }) },
});

const shopItem = defineType({
  name: "shopItem", title: "Produto", type: "document",
  orderings: [{ title: "Posição", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }, { title: "Disponibilidade", name: "availability", by: [{ field: "availability", direction: "asc" }] }, { title: "Título", name: "titleAsc", by: [{ field: "title.pt", direction: "asc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "localizedString", validation: (r) => r.required() }), defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title.pt" }, validation: (r) => r.required() }),
    defineField({ name: "artwork", title: "Obra relacionada (opcional)", type: "reference", to: [{ type: "artwork" }] }), defineField({ name: "productImages", title: "Fotos do produto", type: "array", of: [{ type: "imageEntry" }] }),
    defineField({ name: "description", title: "Descrição", type: "localizedText" }), defineField({ name: "technique", title: "Técnica", type: "localizedString" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "localizedString" }),
    defineField({ name: "price", title: "Preço", type: "number", validation: (r) => r.min(0) }), defineField({ name: "availability", title: "Disponibilidade", type: "string", options: { list: [{ title: "Disponível", value: "available" }, { title: "Esgotado", value: "sold-out" }, { title: "Em breve", value: "coming-soon" }] }, initialValue: "coming-soon" }),
    defineField({ name: "ramonaUrl", title: "URL da Ramona", type: "url", validation: (r) => r.warning().custom((url, context) => (context.document?.availability === "available" && !url ? "Produto disponível sem URL da Ramona." : true)) }),
    defineField({ name: "featured", title: "Destacar", type: "boolean", initialValue: false }), defineField({ name: "order", title: "Ordem", type: "number" }), defineField({ name: "notes", title: "Notas", type: "text" }), defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title.pt", price: "price", availability: "availability", media: "productImages.0.image" }, prepare: ({ title, price, availability, media }) => ({ title: title || "Produto sem título", subtitle: [availability, price != null ? `R$ ${price}` : null].filter(Boolean).join(" · "), media }) },
});

const aboutPage = defineType({ name: "aboutPage", title: "Página Sobre", type: "document", fields: [
  defineField({ name: "creatorHeading", title: "Título da apresentação", type: "localizedString", description: "Título exibido acima da apresentação, em cada idioma." }),
  defineField({ name: "circulationHeading", title: "Título da circulação", type: "localizedString", description: "Título exibido acima da lista de circulação, em cada idioma." }),
  defineField({ name: "intro", title: "Introdução", type: "localizedText" }), defineField({ name: "bio", title: "Biografia", type: "localizedText" }), defineField({ name: "portrait", title: "Retrato", type: "image", options: { hotspot: true } }),
  defineField({ name: "heroMedia", title: "Mídia principal (imagem ou GIF)", type: "file", description: "Arquivo visual ao lado do texto de apresentação. Use este campo para GIFs animados; o retrato existente continua disponível." }),
  defineField({ name: "heroMediaAlt", title: "Texto alternativo da mídia principal", type: "localizedString" }),
  defineField({ name: "circulation", title: "Circulação", type: "array", of: [{ type: "circulationItem" }] }),
  defineField({ name: "clients", title: "Clientes", type: "array", of: [{ type: "localizedString" }] }), defineField({ name: "press", title: "Imprensa", type: "array", of: [{ type: "localizedString" }] }), defineField({ name: "additionalSections", title: "Seções adicionais", type: "array", of: [{ type: "object", fields: [defineField({ name: "heading", title: "Título", type: "localizedString" }), defineField({ name: "body", title: "Conteúdo", type: "localizedText" })] }] }),
  defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
] });

const projectsPage = defineType({ name: "projectsPage", title: "Página Projetos", type: "document", fields: [
  defineField({ name: "eyebrow", title: "Identificação acima do título", type: "localizedString", initialValue: { pt: "ARQUIVO", en: "ARCHIVE" } }),
  defineField({ name: "title", title: "Título", type: "localizedString", initialValue: { pt: "PROJETOS", en: "PROJECTS" }, validation: (r) => r.required() }),
  defineField({ name: "optionalIntro", title: "Introdução (opcional)", type: "localizedText", description: "Deixe em branco para não exibir texto de introdução." }),
] });

const siteSettings = defineType({ name: "siteSettings", title: "Configurações do site", type: "document", fields: [
  defineField({ name: "artistName", title: "Nome artístico", type: "string" }), defineField({ name: "artistSubtitle", title: "Subtítulo", type: "localizedString" }), defineField({ name: "locationLabel", title: "Localização", type: "localizedString" }), defineField({ name: "footerAvailability", title: "Disponibilidade no rodapé", type: "localizedString" }), defineField({ name: "email", title: "E-mail", type: "string" }),
  defineField({ name: "instagram", title: "Instagram", type: "url" }), defineField({ name: "behance", title: "Behance", type: "url" }), defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
  defineField({ name: "seoTitle", title: "Título SEO", type: "localizedString" }), defineField({ name: "seoDescription", title: "Descrição SEO", type: "localizedText" }), defineField({ name: "defaultOgImage", title: "Imagem Open Graph padrão", type: "image" }),
  defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
] });

export const schemaTypes = [localizedString, localizedText, imageEntry, textBlock, imageBlock, galleryBlock, twoImagesBlock, fullWidthImageBlock, mediaBlock, captionBlock, spacerBlock, circulationItem, homePost, artwork, project, shopItem, projectsPage, aboutPage, siteSettings];
