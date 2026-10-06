import { defineField, defineType } from "sanity";

const imageEntry = defineType({
  name: "imageEntry", title: "Imagem de galeria", type: "object",
  fields: [
    defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
    defineField({ name: "caption", title: "Legenda", type: "string" }),
  ],
  preview: { select: { title: "caption", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Imagem sem legenda", media }) },
});

const textBlock = defineType({ name: "textBlock", title: "Texto", type: "object", fields: [
  defineField({ name: "heading", title: "Título (opcional)", type: "string" }),
  defineField({ name: "body", title: "Texto", type: "text", rows: 8, validation: (r) => r.required() }),
] });
const imageBlock = defineType({ name: "imageBlock", title: "Imagem", type: "object", fields: [
  defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
  defineField({ name: "alt", title: "Texto alternativo", type: "string" }), defineField({ name: "caption", title: "Legenda", type: "string" }),
  defineField({ name: "widthStyle", title: "Largura", type: "string", options: { list: ["small", "medium", "large", "full"] }, initialValue: "full" }),
] });
const galleryBlock = defineType({ name: "galleryBlock", title: "Galeria", type: "object", fields: [defineField({ name: "images", title: "Imagens", type: "array", of: [{ type: "imageEntry" }], validation: (r) => r.min(1) })] });
const twoImagesBlock = defineType({ name: "twoImagesBlock", title: "Duas imagens", type: "object", fields: [
  ...["leftImage", "rightImage"].map((name) => defineField({ name, title: name === "leftImage" ? "Imagem esquerda" : "Imagem direita", type: "image", options: { hotspot: true }, validation: (r) => r.required() })),
  ...["leftAlt", "rightAlt", "leftCaption", "rightCaption"].map((name) => defineField({ name, title: name, type: "string" })),
] });
const fullWidthImageBlock = defineType({ name: "fullWidthImageBlock", title: "Imagem largura total", type: "object", fields: [
  defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true }, validation: (r) => r.required() }), defineField({ name: "alt", title: "Texto alternativo", type: "string" }), defineField({ name: "caption", title: "Legenda", type: "string" }),
] });
const mediaBlock = defineType({ name: "mediaBlock", title: "Mídia (GIF/vídeo)", type: "object", fields: [
  defineField({ name: "media", title: "Arquivo", type: "file" }), defineField({ name: "externalUrl", title: "URL externa, se o arquivo não estiver disponível", type: "url" }), defineField({ name: "alt", title: "Texto alternativo", type: "string" }), defineField({ name: "caption", title: "Legenda", type: "string" }),
] });
const captionBlock = defineType({ name: "captionBlock", title: "Legenda", type: "object", fields: [defineField({ name: "body", title: "Legenda", type: "text", rows: 3 })] });
const spacerBlock = defineType({ name: "spacerBlock", title: "Espaçador", type: "object", fields: [defineField({ name: "size", title: "Tamanho", type: "string", options: { list: ["small", "medium", "large"] }, initialValue: "medium" })] });
const circulationItem = defineType({ name: "circulationItem", title: "Item de circulação", type: "object", fields: [
  defineField({ name: "name", title: "Nome", type: "string", validation: (r) => r.required() }), defineField({ name: "organization", title: "Organização", type: "string" }), defineField({ name: "city", title: "Cidade", type: "string" }), defineField({ name: "state", title: "Estado", type: "string" }), defineField({ name: "years", title: "Anos confirmados", type: "array", of: [{ type: "number" }] }), defineField({ name: "description", title: "Descrição", type: "text" }), defineField({ name: "link", title: "Link", type: "url" }),
], preview: { select: { title: "name", subtitle: "city" } } });

const project = defineType({
  name: "project", title: "Projeto", type: "document",
  orderings: [{ title: "Ano (mais recente)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }, { title: "Título", name: "titleAsc", by: [{ field: "title", direction: "asc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "category", title: "Categoria", type: "string" }),
    defineField({ name: "coverImage", title: "Capa", type: "image", options: { hotspot: true } }),
    defineField({ name: "summary", title: "Resumo legado", type: "text", rows: 5 }), defineField({ name: "client", title: "Cliente", type: "string" }),
    defineField({ name: "credits", title: "Créditos", type: "text" }), defineField({ name: "legacyUrl", title: "URL antiga", type: "url" }),
    defineField({ name: "artworks", title: "Obras relacionadas", type: "array", of: [{ type: "reference", to: [{ type: "artwork" }] }] }),
    defineField({ name: "contentBlocks", title: "Conteúdo do projeto", type: "array", of: [{ type: "textBlock" }, { type: "imageBlock" }, { type: "galleryBlock" }, { type: "twoImagesBlock" }, { type: "fullWidthImageBlock" }, { type: "mediaBlock" }, { type: "captionBlock" }, { type: "spacerBlock" }] }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage", year: "year" }, prepare: ({ title, subtitle, media, year }) => ({ title, subtitle: [subtitle, year].filter(Boolean).join(" · "), media }) },
});

const artwork = defineType({
  name: "artwork", title: "Obra", type: "document",
  orderings: [{ title: "Título", name: "titleAsc", by: [{ field: "title", direction: "asc" }] }, { title: "Ano (mais recente)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }), defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "technique", title: "Técnica", type: "string" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "string" }),
    defineField({ name: "description", title: "Descrição", type: "text", rows: 6 }), defineField({ name: "images", title: "Imagens", type: "array", of: [{ type: "imageEntry" }] }),
    defineField({ name: "coverImage", title: "Capa", type: "image", options: { hotspot: true } }), defineField({ name: "categories", title: "Categorias", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: [{ title: "Arquivo", value: "archive" }, { title: "Disponível", value: "available" }, { title: "Esgotada", value: "sold-out" }, { title: "Não está à venda", value: "not-for-sale" }] }, initialValue: "archive" }),
    defineField({ name: "project", title: "Projeto", type: "reference", to: [{ type: "project" }] }), defineField({ name: "legacyUrl", title: "URL antiga", type: "url" }), defineField({ name: "altText", title: "Texto alternativo", type: "string" }), defineField({ name: "notes", title: "Notas editoriais", type: "text" }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title", year: "year", status: "status", media: "coverImage" }, prepare: ({ title, year, status, media }) => ({ title, subtitle: [year, status].filter(Boolean).join(" · "), media }) },
});

const homePost = defineType({
  name: "homePost", title: "Publicação da Home", type: "document",
  fields: [
    defineField({ name: "internalName", title: "Nome interno", type: "string", validation: (r) => r.required() }), defineField({ name: "enabled", title: "Ativa na Home", type: "boolean", initialValue: false }),
    defineField({ name: "image", title: "Imagem da Home", type: "image", options: { hotspot: true }, validation: (r) => r.required() }), defineField({ name: "mobileImage", title: "Imagem para mobile (opcional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "orientation", title: "Orientação", type: "string", description: "Não altera a proporção da imagem. Apenas informa ao layout como tratá-la.", options: { list: ["auto", "portrait", "landscape", "square"] }, initialValue: "auto" }),
    defineField({ name: "sizeHint", title: "Presença visual", type: "string", description: "Indica a presença visual desejada. A posição final continua sendo definida pela composição automática da Home.", options: { list: ["auto", "small", "medium", "large", "hero"] }, initialValue: "auto" }),
    defineField({ name: "artwork", title: "Obra relacionada", type: "reference", to: [{ type: "artwork" }] }), defineField({ name: "project", title: "Projeto relacionado", type: "reference", to: [{ type: "project" }] }),
    defineField({ name: "modalTitle", title: "Título no modal", type: "string" }), defineField({ name: "year", title: "Ano", type: "number" }), defineField({ name: "technique", title: "Técnica", type: "string" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "string" }),
    defineField({ name: "description", title: "Descrição", type: "text", rows: 5 }), defineField({ name: "modalGallery", title: "Imagens deste modal", type: "array", of: [{ type: "imageEntry" }] }), defineField({ name: "altText", title: "Texto alternativo", type: "string" }),
    defineField({ name: "weight", title: "Frequência relativa (opcional)", type: "number", description: "Peso usado apenas para frequência em uma seleção aleatória; não define posição ou ordem." }),
    defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "internalName", subtitle: "project.title", media: "image", enabled: "enabled" }, prepare: ({ title, subtitle, media, enabled }) => ({ title: `${enabled ? "●" : "○"} ${title || "Publicação sem nome"}`, subtitle: subtitle || "Sem projeto relacionado", media }) },
});

const shopItem = defineType({
  name: "shopItem", title: "Produto", type: "document",
  orderings: [{ title: "Posição", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }, { title: "Disponibilidade", name: "availability", by: [{ field: "availability", direction: "asc" }] }],
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }), defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "artwork", title: "Obra relacionada (opcional)", type: "reference", to: [{ type: "artwork" }] }), defineField({ name: "productImages", title: "Fotos do produto", type: "array", of: [{ type: "imageEntry" }] }),
    defineField({ name: "description", title: "Descrição", type: "text", rows: 5 }), defineField({ name: "technique", title: "Técnica", type: "string" }), defineField({ name: "dimensions", title: "Dimensões", type: "string" }), defineField({ name: "edition", title: "Edição", type: "string" }),
    defineField({ name: "price", title: "Preço", type: "number", validation: (r) => r.min(0) }), defineField({ name: "availability", title: "Disponibilidade", type: "string", options: { list: [{ title: "Disponível", value: "available" }, { title: "Esgotado", value: "sold-out" }, { title: "Em breve", value: "coming-soon" }] }, initialValue: "coming-soon" }),
    defineField({ name: "ramonaUrl", title: "URL da Ramona", type: "url", validation: (r) => r.warning().custom((url, context) => (context.document?.availability === "available" && !url ? "Produto disponível sem URL da Ramona." : true)) }),
    defineField({ name: "featured", title: "Destacar", type: "boolean", initialValue: false }), defineField({ name: "order", title: "Ordem", type: "number" }), defineField({ name: "notes", title: "Notas", type: "text" }), defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
  ],
  preview: { select: { title: "title", price: "price", availability: "availability", media: "productImages.0.image" }, prepare: ({ title, price, availability, media }) => ({ title, subtitle: [availability, price != null ? `R$ ${price}` : null].filter(Boolean).join(" · "), media }) },
});

const aboutPage = defineType({ name: "aboutPage", title: "Página Sobre", type: "document", fields: [
  defineField({ name: "intro", title: "Introdução", type: "text", rows: 5 }), defineField({ name: "bio", title: "Biografia", type: "text", rows: 10 }), defineField({ name: "portrait", title: "Retrato", type: "image", options: { hotspot: true } }),
  defineField({ name: "circulation", title: "Circulação", type: "array", of: [{ type: "circulationItem" }] }),
  defineField({ name: "clients", title: "Clientes", type: "array", of: [{ type: "string" }] }), defineField({ name: "press", title: "Imprensa", type: "array", of: [{ type: "string" }] }), defineField({ name: "additionalSections", title: "Seções adicionais", type: "array", of: [{ type: "object", fields: [defineField({ name: "heading", title: "Título", type: "string" }), defineField({ name: "body", title: "Conteúdo", type: "text" })] }] }),
  defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
] });

const siteSettings = defineType({ name: "siteSettings", title: "Configurações do site", type: "document", fields: [
  defineField({ name: "artistName", title: "Nome artístico", type: "string" }), defineField({ name: "artistSubtitle", title: "Subtítulo", type: "string" }), defineField({ name: "email", title: "E-mail", type: "string" }),
  defineField({ name: "instagram", title: "Instagram", type: "url" }), defineField({ name: "behance", title: "Behance", type: "url" }), defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
  defineField({ name: "seoTitle", title: "Título SEO", type: "string" }), defineField({ name: "seoDescription", title: "Descrição SEO", type: "text", rows: 3 }), defineField({ name: "defaultOgImage", title: "Imagem Open Graph padrão", type: "image" }),
  defineField({ name: "migrationFingerprint", title: "Controle da migração", type: "string", readOnly: true, hidden: true }),
] });

export const schemaTypes = [imageEntry, textBlock, imageBlock, galleryBlock, twoImagesBlock, fullWidthImageBlock, mediaBlock, captionBlock, spacerBlock, circulationItem, homePost, artwork, project, shopItem, aboutPage, siteSettings];
