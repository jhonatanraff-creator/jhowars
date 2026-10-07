import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const commit = process.argv.includes("--commit");
const dryRun = process.argv.includes("--dry-run") || !commit;
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Sanity não configurado: confira as variáveis locais obrigatórias.");
if (commit && process.env.I18N_MIGRATION_CONFIRM !== "YES") throw new Error("Confirmação ausente; nenhuma gravação foi feita.");
if (commit && dataset === "production" && !allowProduction) throw new Error("O dataset production exige --allow-production.");

const client = createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false, perspective: "published" });
const content = readFileSync("docs/legacy/content.md", "utf8");
const inventory = readFileSync("docs/legacy/projects.md", "utf8");
const projectRows = [
  ["veja-saude-editorial-illustration", "VEJA SAÚDE", "VEJA SAÚDE — Editorial Illustration", "Editorial / Ilustração editorial"],
  ["corpos-graficos", "Corpos Gráficos", "Corpos Gráficos", ""],
  ["bestas-do-dia-brazilian-wildlife", "BESTAS DO DIA", "BESTAS DO DIA - Brazilian Wildlife", "Ilustração / identidade visual"],
  ["bumba-meu-boi", "BUMBA MEU BOI", "BUMBA MEU BOI", "Ilustração / risografia"],
  ["fogo-fossil", "FOGO FÓSSIL", "FOGO FÓSSIL - Selection of illustrations", "Ilustração / impressão"],
  ["posters-2024-experimental-print-and-illustration", "Posters 2024", "Posters 2024 - Experimental Print and Illustration", "Impressão experimental e ilustração"],
  ["o-que-fica-project-editorial", "O Que Fica", "O Que Fica - Project Editorial", "Projeto editorial / livro"],
  ["countenance-illustration", "Countenance", "Countenance - Selection of illustrations", "Ilustração digital"],
];
const titles = new Map(projectRows.map(([slug, pt, en]) => [slug, { pt, en }]));
const categoryEn = new Map([["Editorial", "Editorial"], ["Ilustração / identidade visual", "Illustration / visual identity"], ["Ilustração / risografia", "Illustration / risograph"], ["Ilustração / impressão", "Illustration / print"], ["Impressão experimental e ilustração", "Experimental print and illustration"], ["Projeto editorial / livro", "Editorial project / book"], ["Ilustração digital", "Digital illustration"]]);
const palette = ["#2856A6", "#E72C25", "#FFC400", "#ED3E83", "#F36B21", "#111111", "#2856A6", "#E72C25"];
const textPalette = ["#FFFFFF", "#FFFFFF", "#111111", "#FFFFFF", "#111111", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
const homeColors = new Map(projectRows.map(([slug], index) => [slug, { hoverBackgroundColor: palette[index], hoverTextColor: textPalette[index] }]));
const projectCopy = new Map();
function sectionCopy(title) {
  const start = content.indexOf(`### ${title} —`);
  if (start < 0) return { pt: "", en: "" };
  const next = content.indexOf("\n### ", start + 5);
  const end2 = content.indexOf("\n## ", start + 5);
  const ends = [next, end2].filter((i) => i >= 0);
  const section = content.slice(start, ends.length ? Math.min(...ends) : content.length);
  const result = { pt: [], en: [] };
  let language;
  for (const line of section.split(/\r?\n/)) {
    if (line.startsWith("#### Português")) language = "pt";
    else if (line.startsWith("#### English")) language = "en";
    else if (line.startsWith("#### ")) language = undefined;
    else if (language && line.startsWith("> ")) {
      const text = line.slice(2).trim();
      if (text && !text.startsWith("Essa versão comunica cliente") && !text.startsWith("Esse texto funciona bem no ponto")) result[language].push(text);
    }
  }
  return { pt: result.pt.join("\n\n"), en: result.en.join("\n\n") };
}
for (const [, , title] of projectRows) projectCopy.set(title, sectionCopy(title));
function inventoryCopy(title) {
  const start = inventory.indexOf(`## ${title}`);
  if (start < 0) return { pt: "", en: "" };
  const end = inventory.indexOf("\n## ", start + 4);
  const section = inventory.slice(start, end < 0 ? inventory.length : end);
  const pick = (lang) => section.match(new RegExp(`- \\*\\*Descrição ${lang} \\(literal\\):\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|$)`))?.[1]?.trim().replace(/\n+/g, " ") || "";
  const pt = pick("PT");
  const en = pick("EN");
  return { pt: pt === "NÃO IDENTIFICADO" ? "" : pt, en: en === "NÃO IDENTIFICADO" ? "" : en };
}
const summaryBySlug = new Map(projectRows.map(([slug, , title]) => [slug, inventoryCopy(title)]));

const circulationEn = new Map([
  ["Mãos Sujas", "A collective focused on graphic art and handmade printing."],
  ["Miolo(s)", "A graphic culture gathering organized since 2014 by Mário de Andrade Library and Editora Lote 42."],
  ["Printa-Feira", "A graphic art and handmade printing fair organized by SESC São Paulo in partnership with Editora Lote 42."],
  ["Mamute", "A graphic art, literature, craft, and independent publishing fair organized by Gloriosa Cultural, with support from MinC and Petrobras."],
  ["Festival Dobra", "A printmaking festival organized by Grafatório."],
  ["Mini Dobra", "A recurring, more intimate version of Festival Dobra, held at Grafatório."],
  ["Feira Goma", "A creative, collaborative gathering of independent artists and producers."],
  ["Encontro Ilustre", "An event focused on authorial and independent illustration."],
]);
const bioEn = [
  "I am Jhow.ars, an illustrator and designer, an alter ego of Jhonatan Rafael. This is an authorial project where art and design meet in constant experimentation, between the handmade and the digital, between unique works and series that unfold across different formats.",
  "My work grows from my lived experience, observing everyday life, and an imagination shaped by Brazil, art naïf, and the exploration of forms, colors, and visual narratives that arise from the desire to create and tell stories through images.",
  "Part of this process happens in dialogue with other artists, at Grafatório and in the Mãos Sujas collective, in Londrina, where handmade printing, exchange, and collective making also nourish and expand this universe in progress.",
].join("\n\n");
const aboutSectionTranslations = new Map([
  ["Base", { heading: "Base", body: "Based in Londrina — 2023–present" }],
  ["Contato (texto legado)", { heading: "Contact (legacy copy)", body: "This is a place for experimentation and process. If something here resonated with you and became an idea, a project, or a desire to collaborate, the path begins with an email." }],
  ["Informações do site (texto legado)", { heading: "Site information (legacy copy)", body: "Based in: Brazil\nAvailable for: collaborations, partnerships and projects with a distinct identity" }],
]);
const settingsPairs = {
  artistSubtitle: { pt: "ARTISTA VISUAL E ILUSTRADOR", en: "VISUAL ARTIST & ILLUSTRATOR" },
  locationLabel: { pt: "Brasil", en: "Brazil" },
  footerAvailability: { pt: "Disponível para: colaborações, parcerias e projetos com identidade autoral", en: "Available for: collaborations, partnerships and projects with a distinct identity" },
  seoTitle: { pt: "Jhow.ars — Artista visual, ilustração e design editorial", en: "Jhow.ars — Visual Artist, Illustration & Editorial Design" },
  seoDescription: { pt: "Portfólio de Jhow.ars, artista visual e designer com foco em ilustração, edições impressas, livros de artista, zines e projetos visuais experimentais.", en: "Visual artist and designer focused on illustration, print editions, art books, zines and experimental visual projects. Authorial portfolio by Jhow.ars." },
};

const isSet = (value) => typeof value === "string" && value.length > 0;
function localized(current, pairs = {}) {
  const proposed = { pt: pairs.pt || "", en: pairs.en || "" };
  const target = typeof current === "string"
    ? { pt: proposed.pt || current, en: proposed.en || (proposed.pt && current !== proposed.pt ? current : "") }
    : { pt: current?.pt || proposed.pt, en: current?.en || proposed.en };
  if (typeof current === "object" && current) {
    if (proposed.pt && proposed.en && target.pt === proposed.en && proposed.pt !== proposed.en) target.pt = proposed.pt;
    if (proposed.pt && proposed.en && target.en === proposed.pt && proposed.pt !== proposed.en) target.en = proposed.en;
  }
  const metadata = current && typeof current === "object" ? Object.fromEntries(["_type", "_key"].filter((key) => current[key] !== undefined).map((key) => [key, current[key]])) : {};
  return { ...metadata, pt: target.pt, en: target.en };
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function findProject(doc, projectDocs) {
  if (doc._type === "project") return doc;
  const projectRef = doc.project?._ref;
  if (projectRef) return projectDocs.find((item) => item._id === projectRef);
  if (doc._type === "homePost") return projectDocs.find((item) => item._id === `legacy-project-${doc._id.replace(/^legacy-home-/, "")}`);
  return undefined;
}
function legacyPairs(slug, existing, field) {
  const copy = summaryBySlug.get(slug) || { pt: "", en: "" };
  const sections = projectCopy.get(projectRows.find((row) => row[0] === slug)?.[2]) || { pt: "", en: "" };
  if (field === "title" || field === "modalTitle" || field === "altText") return titles.get(slug) || { pt: existing, en: existing };
  if (field === "category") return { pt: existing, en: categoryEn.get(existing) || existing };
  if (field === "summary" || field === "description") return { pt: copy.pt || existing || "", en: copy.en || sections.en || "" };
  if (field === "technique") {
    const translated = { "Ilustração / risografia": "Illustration / risograph", "Ilustração editorial": "Editorial illustration", "Ilustração digital": "Digital illustration", "Serigrafia": "Screen printing", "Riso": "Risograph printing" };
    return { pt: existing || "", en: translated[existing] || existing || "" };
  }
  return { pt: existing || "", en: existing || "" };
}
function localizedMedia(value) {
  if (Array.isArray(value)) return value.map((entry) => ({ ...entry, ...(entry.alt !== undefined ? { alt: localized(entry.alt, { pt: entry.alt, en: entry.alt }) } : {}), ...(entry.caption !== undefined ? { caption: localized(entry.caption, { pt: entry.caption, en: entry.caption }) } : {}) }));
  return value;
}

const docs = await client.fetch('*[_type in ["project", "artwork", "homePost", "aboutPage", "siteSettings", "shopItem"]]{...}');
if (!docs.length) throw new Error("A consulta não encontrou documentos; a migração foi interrompida.");
const projectDocs = docs.filter((doc) => doc._type === "project");
const plans = [];
for (const doc of docs) {
  const changes = {};
  const project = findProject(doc, projectDocs);
  const slug = project?.slug?.current;
  if (doc._type === "project") {
    const title = titles.get(slug) || { pt: doc.title, en: doc.title };
    changes.title = localized(doc.title, title);
    if (doc.category) changes.category = localized(doc.category, legacyPairs(slug, doc.category, "category"));
    const summary = summaryBySlug.get(slug) || {};
    if (doc.summary) changes.summary = localized(doc.summary, summary);
    if (doc.client) changes.client = localized(doc.client, { pt: doc.client, en: doc.client });
    if (doc.credits) changes.credits = localized(doc.credits, { pt: doc.credits, en: doc.credits });
    if (Array.isArray(doc.contentBlocks)) {
      const copyPair = projectCopy.get(projectRows.find((row) => row[0] === slug)?.[2]) || { pt: "", en: "" };
      changes.contentBlocks = doc.contentBlocks.map((block) => {
        const mapped = { ...block };
        if (block._type === "textBlock" && (block.body || copyPair.pt || copyPair.en)) mapped.body = localized(block.body, copyPair);
        if (block._type === "textBlock" && block.heading) mapped.heading = localized(block.heading, { pt: block.heading, en: block.heading });
        for (const field of ["alt", "caption", "leftAlt", "rightAlt", "leftCaption", "rightCaption"]) if (typeof block[field] === "string") mapped[field] = localized(block[field], { pt: block[field], en: block[field] });
        if (Array.isArray(block.images)) mapped.images = localizedMedia(block.images);
        return mapped;
      });
    }
  } else if (doc._type === "artwork") {
    changes.title = localized(doc.title, legacyPairs(slug, doc.title, "title"));
    for (const field of ["technique", "edition", "description", "altText"]) if (doc[field] !== undefined) changes[field] = localized(doc[field], legacyPairs(slug, doc[field], field));
    if (Array.isArray(doc.images)) changes.images = localizedMedia(doc.images);
  } else if (doc._type === "homePost") {
    const color = homeColors.get(slug) || { hoverBackgroundColor: "#2856A6", hoverTextColor: "#FFFFFF" };
    changes.hoverBackgroundColor = doc.hoverBackgroundColor || color.hoverBackgroundColor;
    changes.hoverTextColor = doc.hoverTextColor || color.hoverTextColor;
    if (doc.modalTitle !== undefined) changes.modalTitle = localized(doc.modalTitle, legacyPairs(slug, doc.modalTitle, "modalTitle"));
    for (const field of ["technique", "edition", "description", "altText"]) if (doc[field] !== undefined) changes[field] = localized(doc[field], legacyPairs(slug, doc[field], field));
    if (Array.isArray(doc.modalGallery)) changes.modalGallery = localizedMedia(doc.modalGallery);
  } else if (doc._type === "aboutPage") {
    const oldBio = doc.bio;
    changes.bio = localized(oldBio, { pt: typeof oldBio === "string" ? oldBio : "", en: bioEn });
    if (doc.intro !== undefined) changes.intro = localized(doc.intro, { pt: typeof doc.intro === "string" ? doc.intro : "", en: "" });
    if (Array.isArray(doc.circulation)) changes.circulation = doc.circulation.map((item) => ({ ...item, ...(item.description ? { description: localized(item.description, { pt: item.description, en: circulationEn.get(item.name) || "" }) } : {}) }));
    if (Array.isArray(doc.clients)) changes.clients = doc.clients.map((item) => localized(item, { pt: item, en: item }));
    if (Array.isArray(doc.press)) changes.press = doc.press.map((item) => localized(item, { pt: item, en: item }));
    if (Array.isArray(doc.additionalSections)) changes.additionalSections = doc.additionalSections.map((item) => {
      const translated = aboutSectionTranslations.get(item.heading) || {};
      return { ...item, ...(item.heading ? { heading: localized(item.heading, { pt: item.heading, en: translated.heading || item.heading }) } : {}), ...(item.body ? { body: localized(item.body, { pt: item.body, en: translated.body || "" }) } : {}) };
    });
  } else if (doc._type === "siteSettings") {
    for (const [field, pairs] of Object.entries(settingsPairs)) changes[field] = localized(doc[field], pairs);
  } else if (doc._type === "shopItem") {
    for (const field of ["title", "description", "technique", "edition"]) if (doc[field] !== undefined) changes[field] = localized(doc[field], { pt: doc[field], en: "" });
    if (Array.isArray(doc.productImages)) changes.productImages = localizedMedia(doc.productImages);
  }
  const cleaned = Object.fromEntries(Object.entries(changes).filter(([field, value]) => value !== undefined && canonical(value) !== canonical(doc[field])));
  if (Object.keys(cleaned).length) plans.push({ doc, changes: cleaned });
}

const counts = plans.reduce((summary, plan) => ({ ...summary, [plan.doc._type]: (summary[plan.doc._type] || 0) + 1 }), {});
const missingEnglish = [];
for (const { doc, changes } of plans) {
  for (const [field, value] of Object.entries(changes)) {
    const inspect = (entry, location) => {
      if (Array.isArray(entry)) entry.forEach((child, index) => inspect(child, `${location}[${index}]`));
      else if (entry && typeof entry === "object") {
        if ("pt" in entry && "en" in entry && isSet(entry.pt) && !isSet(entry.en)) missingEnglish.push(`${doc._id}.${location}`);
        else for (const [key, child] of Object.entries(entry)) inspect(child, `${location}.${key}`);
      }
    };
    inspect(value, field);
  }
}
console.log(`DRY RUN ${dryRun ? "(sem gravação)" : "(aplicação)"}: ${docs.length} documentos consultados; ${plans.length} documentos no plano.`);
for (const [type, count] of Object.entries(counts)) console.log(`${type}: ${count} documentos preparados`);
console.log(`HomePosts com cores persistidas ou preservadas: ${docs.filter((doc) => doc._type === "homePost").length}.`);
console.log(`Campos localizados com EN ainda sem tradução confirmada: ${new Set(missingEnglish).size}.`);
if (missingEnglish.length) console.log(`Campos sem texto EN confirmado (não inventados): ${[...new Set(missingEnglish)].join(", ")}`);
if (dryRun) { console.log("DRY-RUN: nenhuma gravação executada."); process.exit(0); }
let updated = 0;
for (const { doc, changes } of plans) {
  const { _rev, _id } = doc;
  await client.patch(_id).ifRevisionId(_rev).set(changes).commit({ visibility: "sync" });
  updated += 1;
}
console.log(`Migração concluída com ${updated} documentos atualizados. IDs e referências foram preservados; nenhum documento foi removido.`);
