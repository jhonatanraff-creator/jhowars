import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run") || !process.argv.includes("--commit");
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
const modules = JSON.parse(readFileSync(path.join(root, "data/legacy-modules.json"), "utf8"));
const projectMetadata = [
  ["veja-saude-editorial-illustration", "VEJA SAÚDE — Editorial Illustration", 2026, "Ilustração editorial", "2faa9f2c-7f03-4924-8876-0ff94a367005"],
  ["corpos-graficos", "Corpos Gráficos", null, null, "b3630477-ccc3-4887-a1d0-70f01b523a7b"],
  ["bestas-do-dia-brazilian-wildlife", "BESTAS DO DIA - Brazilian Wildlife", null, "Ilustração / identidade visual", "635d16ae-65a5-4acf-9fcb-bbe57ea6ad0e"],
  ["bumba-meu-boi", "BUMBA MEU BOI", null, "Ilustração / risografia", "13a5f1fa-4b99-4f3e-b95b-e836af08a03c"],
  ["fogo-fossil", "FOGO FÓSSIL - Selection of illustrations", null, "Ilustração / impressão", "36c3c45e-2099-485b-91a2-f28d31b1e87b"],
  ["posters-2024-experimental-print-and-illustration", "Posters 2024 - Experimental Print and Illustration", 2024, "Impressão experimental e ilustração", "b62d23fc-134e-4e95-9f8a-c9b16eef50db"],
  ["o-que-fica-project-editorial", "O Que Fica - Project Editorial", null, "Projeto editorial / livro", "413bba96-3e41-4216-9154-84fc49ca0d3a"],
  ["countenance-illustration", "Countenance - Selection of illustrations", null, "Ilustração digital", "78fa029f-af65-4956-87a5-9084e168520b"],
];
const assetRows = readFileSync(path.join(root, "docs/legacy/assets.md"), "utf8").split(/\r?\n/).filter((line) => /^\| (?:BRAND|PROJECT IMAGE|ARTWORK|EDITORIAL|MOCKUP|PROCESS|PHOTO|GIF|ICON|UNKNOWN) \|/.test(line));
const assetById = new Map();
for (const line of assetRows) {
  const cells = line.split("|").map((part) => part.trim());
  const id = cells[3]?.match(/[a-f0-9]{8}-[a-f0-9-]{27,}/i)?.[0];
  const url = cells[7]?.match(/https:\/\/[^\s`]+/)?.[0];
  if (id) assetById.set(id, { url, page: cells[2], category: cells[1], local: cells[8]?.includes("public/") ? cells[8].match(/public\/[^`\s]+/)?.[0] : undefined });
}
const adobeVideo = readFileSync(path.join(root, "docs/legacy/assets.md"), "utf8").split(/\r?\n/).find((line) => line.includes("UNKNOWN / VIDEO") && line.includes("/o-que-fica-project-editorial") && line.includes(".mp4"))?.split("|").map((part) => part.trim()).find((cell) => cell.includes("https://"))?.match(/https:\/\/[^\s`]+/)?.[0];
const contentSource = readFileSync(path.join(root, "docs/legacy/content.md"), "utf8");
const projectInventory = readFileSync(path.join(root, "docs/legacy/projects.md"), "utf8");
const projectSummary = (title, language) => {
  const start = projectInventory.indexOf(`## ${title}`);
  if (start < 0) return undefined;
  const next = projectInventory.indexOf("\n## ", start + 4);
  const section = projectInventory.slice(start, next < 0 ? projectInventory.length : next);
  const match = section.match(new RegExp(`- \\*\\*Descrição ${language} \\(literal\\):\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|$)`));
  const text = match?.[1]?.trim();
  return text && text !== "NÃO IDENTIFICADO" ? text : undefined;
};
const projectSection = (title) => {
  const start = contentSource.indexOf(`### ${title} —`);
  if (start < 0) return "";
  const nextLevel3 = contentSource.indexOf("\n### ", start + 5);
  const nextLevel2 = contentSource.indexOf("\n## ", start + 5);
  const boundaries = [nextLevel3, nextLevel2].filter((index) => index >= 0);
  const raw = contentSource.slice(start, boundaries.length ? Math.min(...boundaries) : contentSource.length);
  let language;
  const paragraphs = { pt: [], en: [] };
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith("#### Português")) { language = "pt"; continue; }
    if (line.startsWith("#### English")) { language = "en"; continue; }
    if (/^#### /.test(line)) { language = undefined; continue; }
    if (language && line.startsWith("> ")) {
      const text = line.slice(2).trim();
      if (!text || text.includes("Essa versão comunica cliente + edição + temas + problema editorial + sua solução visual sem virar textão.") || text.includes("Esse texto funciona bem no ponto em que você sai das artes isoladas e começa a mostrar as páginas e duplas.")) continue;
      const ptStart = text.indexOf(" Do chão para as copas das árvores.");
      if (language === "en" && ptStart > 0) {
        paragraphs.en.push(text.slice(0, ptStart).trim());
        paragraphs.pt.push(text.slice(ptStart + 1).trim());
      } else paragraphs[language].push(text);
    }
  }
  return { pt: paragraphs.pt.join("\n\n"), en: paragraphs.en.join("\n\n") };
};
const localized = (pt, en = "") => ({ pt: pt || "", en: en || "" });
const ptProjectTitles = new Map(projectMetadata.map(([slug, title]) => [slug, ({
  "VEJA SAÚDE — Editorial Illustration": "VEJA SAÚDE", "Corpos Gráficos": "Corpos Gráficos", "BESTAS DO DIA - Brazilian Wildlife": "BESTAS DO DIA",
  "BUMBA MEU BOI": "BUMBA MEU BOI", "FOGO FÓSSIL - Selection of illustrations": "FOGO FÓSSIL", "Posters 2024 - Experimental Print and Illustration": "Posters 2024",
  "O Que Fica - Project Editorial": "O Que Fica", "Countenance - Selection of illustrations": "Countenance",
})[title] || title]));
const categoryEnglish = new Map([["Ilustração / identidade visual", "Illustration / visual identity"], ["Ilustração / risografia", "Illustration / risograph"], ["Ilustração / impressão", "Illustration / print"], ["Projeto editorial / livro", "Editorial project / book"], ["Impressão experimental e ilustração", "Experimental print and illustration"], ["Ilustração digital", "Digital illustration"]]);
const hoverPairs = [
  ["#2856A6", "#FFFFFF"], ["#E72C25", "#FFFFFF"], ["#FFC400", "#111111"], ["#ED3E83", "#FFFFFF"],
  ["#F36B21", "#111111"], ["#111111", "#FFFFFF"], ["#2856A6", "#FFFFFF"], ["#E72C25", "#FFFFFF"],
];
const coverBySlug = new Map([
  ["veja-saude-editorial-illustration", "/legacy/veja-saude/cover.png"], ["corpos-graficos", "/legacy/corpos-graficos/cover.png"],
  ["bestas-do-dia-brazilian-wildlife", "/legacy/bestas-do-dia/cover.png"], ["bumba-meu-boi", "/legacy/bumba-meu-boi/cover.png"],
  ["fogo-fossil", "/legacy/fogo-fossil/cover.png"], ["posters-2024-experimental-print-and-illustration", "/legacy/posters-2024/cover.jpg"],
  ["o-que-fica-project-editorial", "/legacy/o-que-fica/cover.png"], ["countenance-illustration", "/legacy/countenance/cover.jpg"],
]);
const additionalProjectImages = new Map([
  ["posters-2024-experimental-print-and-illustration", ["296c8bc9-7529-4597-820f-92431596bc64"]],
  ["countenance-illustration", ["a1f9bafc-ff53-40b5-9f4b-f38d469bd659"]],
]);
const additionalLocalImages = new Map([["296c8bc9-7529-4597-820f-92431596bc64", "/legacy/posters-2024/second.jpg"], ["a1f9bafc-ff53-40b5-9f4b-f38d469bd659", "/legacy/countenance/second.jpg"]]);
const sectionTitle = new Map(projectMetadata.map(([, title]) => [title, title]));
const projectModule = (slug) => modules.find((page) => page.modules.some((mod) => mod.ids.some((id) => assetById.get(id)?.page === `/${slug}`)));
const records = [];
const missingAssets = new Set();
const assetHashes = new Map();
const uploadedAssets = new Map();
let imageCount = 0, gifCount = 0, duplicateCount = 0;

function assetIdFor(id) { return `legacy-asset-${id}`; }
function localFor(id, slug) {
  const cover = projectMetadata.find((p) => p[0] === slug)?.[4];
  if (id === cover) return coverBySlug.get(slug);
  if (additionalProjectImages.get(slug)?.includes(id)) return additionalLocalImages.get(id);
  for (const candidate of [assetById.get(id)?.local, `public/legacy/${slug}/${id}.png`, `public/legacy/${slug}/${id}.jpg`, `public/legacy/${slug}/${id}.gif`].filter(Boolean)) if (existsSync(path.join(root, candidate))) return `/${candidate.replace(/^public\//, "")}`;
  return undefined;
}
async function getMedia(id, slug, client) {
  if (uploadedAssets.has(id)) return uploadedAssets.get(id);
  const local = localFor(id, slug);
  const url = assetById.get(id)?.url;
  if (dryRun) {
    if (!local && !url) missingAssets.add(id);
    const ref = assetIdFor(id);
    uploadedAssets.set(id, ref);
    const mediaPath = local || (url ? new URL(url).pathname : "");
    const ext = path.extname(mediaPath).toLowerCase();
    if (ext === ".gif") gifCount++;
    else imageCount++;
    return ref;
  }
  if (!local && url) {
    const remoteFilename = path.basename(new URL(url).pathname);
    const remoteExtension = path.extname(remoteFilename).toLowerCase();
    const remoteType = remoteExtension === ".gif" || remoteExtension === ".mp4" || remoteExtension === ".webm" ? "sanity.fileAsset" : "sanity.imageAsset";
    const filenameMatches = await client.fetch(`*[_type == $type && originalFilename == $filename][0...2]{_id, sha256hash}`, { type: remoteType, filename: remoteFilename });
    if (filenameMatches.length === 1) {
      const existing = filenameMatches[0];
      let assetRef = existing._id;
      const isDuplicate = Boolean(existing.sha256hash && assetHashes.has(existing.sha256hash));
      if (isDuplicate) { duplicateCount++; assetRef = assetHashes.get(existing.sha256hash); }
      else if (existing.sha256hash) assetHashes.set(existing.sha256hash, existing._id);
      uploadedAssets.set(id, assetRef);
      if (!isDuplicate) { if (remoteExtension === ".gif") gifCount++; else imageCount++; }
      return assetRef;
    }
  }
  let buffer;
  let filename;
  try {
    if (local) { buffer = await readFile(path.join(root, "public", local.replace(/^\//, ""))); filename = path.basename(local); }
    else if (url) { const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`); buffer = Buffer.from(await response.arrayBuffer()); filename = path.basename(new URL(url).pathname); }
    else throw new Error("sem arquivo local ou URL CDN no inventário");
  } catch (error) { missingAssets.add(`${id}: ${error.message}`); return undefined; }
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (assetHashes.has(hash)) { duplicateCount++; const ref = assetHashes.get(hash); uploadedAssets.set(id, ref); return ref; }
  const extension = path.extname(filename).toLowerCase();
  const type = extension === ".gif" || extension === ".mp4" || extension === ".webm" ? "file" : "image";
  const existing = await client.fetch(`*[_type == $type && sha256hash == $hash][0]._id`, { type: type === "image" ? "sanity.imageAsset" : "sanity.fileAsset", hash });
  const asset = existing ? { _id: existing } : await client.assets.upload(type, buffer, { filename, contentType: type === "file" ? (extension === ".gif" ? "image/gif" : undefined) : undefined });
  assetHashes.set(hash, asset._id); uploadedAssets.set(id, asset._id);
  if (extension === ".gif") gifCount++; else imageCount++;
  return asset._id;
}

const ref = (id) => ({ _type: "reference", _ref: id });
const arrayRef = (id, key) => ({ _type: "reference", _key: key, _ref: id });
const imageField = (asset) => asset ? { _type: "image", asset: ref(asset) } : undefined;
function compact(value) {
  if (Array.isArray(value)) return value.map(compact).filter((item) => item !== undefined);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined).map(([key, child]) => [key, compact(child)]));
  return value;
}
const withFingerprint = (doc) => { const clean = compact(doc); return { ...clean, migrationFingerprint: fingerprint(clean) }; };
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).filter((key) => key !== "migrationFingerprint").sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function fingerprint(doc) { return createHash("sha256").update(stable(doc)).digest("hex"); }
function localDimensions(relativePath) {
  if (!relativePath) return undefined;
  try {
    const data = readFileSync(path.join(root, "public", relativePath.replace(/^\//, "")));
    if (data.toString("ascii", 1, 4) === "PNG") return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
    if (data.toString("ascii", 0, 3) === "GIF") return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
    if (data[0] === 0xff && data[1] === 0xd8) {
      let offset = 2;
      while (offset < data.length) { if (data[offset] !== 0xff) break; const marker = data[offset + 1]; const size = data.readUInt16BE(offset + 2); if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) }; offset += size + 2; }
    }
  } catch { return undefined; }
  return undefined;
}

if (!dryRun) {
  if (!projectId || !dataset) throw new Error("Configure NEXT_PUBLIC_SANITY_PROJECT_ID e NEXT_PUBLIC_SANITY_DATASET.");
  if (!token || process.env.SANITY_SEED_CONFIRM !== "YES") throw new Error("Para gravar, informe SANITY_API_TOKEN e SANITY_SEED_CONFIRM=YES.");
  if (dataset === "production" && !allowProduction) throw new Error("O dataset production exige --allow-production explícito.");
}
const client = !dryRun ? createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false, perspective: "published" }) : undefined;

for (const [projectIndex, [slug, title, year, category, coverId]] of projectMetadata.entries()) {
  const projectIdValue = `legacy-project-${slug}`;
  const artworkId = `legacy-artwork-${slug}-${String(projectIndex + 1).padStart(2, "0")}`;
  const coverPath = coverBySlug.get(slug);
  const moduleRecord = projectModule(slug);
  const idOrder = [...new Set((moduleRecord?.modules || []).flatMap((mod) => mod.ids).filter((id) => assetById.get(id)?.page === `/${slug}`))];
  if (!idOrder.includes(coverId)) idOrder.unshift(coverId);
  for (const id of additionalProjectImages.get(slug) || []) if (!idOrder.includes(id)) idOrder.push(id);
  const body = projectSection(sectionTitle.get(title) || title);
  const summary = { pt: projectSummary(title, "PT"), en: projectSummary(title, "EN") };
  const projectBlocks = [];
  let copyInserted = false;
  for (const [moduleIndex, mod] of (moduleRecord?.modules || []).entries()) {
    if (mod.type.includes("text")) { if ((body.pt || body.en) && !copyInserted) { projectBlocks.push({ _type: "textBlock", _key: "legacy-copy", body: localized(body.pt, body.en) }); copyInserted = true; } continue; }
    if (mod.type.includes("video")) { if (adobeVideo) projectBlocks.push({ _type: "mediaBlock", _key: `legacy-video-${moduleIndex}`, externalUrl: adobeVideo, caption: "" }); continue; }
    const ids = mod.ids.filter((id) => assetById.get(id)?.page === `/${slug}`);
    if (!ids.length) continue;
    if (mod.type.includes("media_collection")) {
      let galleryImages = [];
      const flushGallery = () => { if (galleryImages.length) projectBlocks.push({ _type: "galleryBlock", _key: `legacy-gallery-${moduleIndex}-${projectBlocks.length}`, images: galleryImages }); galleryImages = []; };
      ids.forEach((id, index) => {
        if (/\.gif(?:\?|$)/i.test(assetById.get(id)?.url || "")) { flushGallery(); projectBlocks.push({ _type: "mediaBlock", _key: `legacy-media-${moduleIndex}-${index}`, _legacyAssetId: id, alt: "", caption: "" }); }
        else galleryImages.push({ _type: "imageEntry", _key: `legacy-${moduleIndex}-${index}`, _legacyAssetId: id });
      });
      flushGallery();
    } else {
      for (const [index, id] of ids.entries()) projectBlocks.push({ _type: "imageBlock", _key: `legacy-image-${moduleIndex}-${index}`, _legacyAssetId: id, alt: "", widthStyle: "full" });
    }
  }
  if ((body.pt || body.en) && !copyInserted) projectBlocks.unshift({ _type: "textBlock", _key: "legacy-copy", body: localized(body.pt, body.en) });
  for (const id of additionalProjectImages.get(slug) || []) if (!(moduleRecord?.modules || []).some((mod) => mod.ids.includes(id))) projectBlocks.push({ _type: "imageBlock", _key: `legacy-additional-${id}`, _legacyAssetId: id, alt: "", widthStyle: "full" });
  const coverRef = await getMedia(coverId, slug, client);
  const dimensions = localDimensions(coverPath);
  const orientation = dimensions ? dimensions.width === dimensions.height ? "square" : dimensions.width > dimensions.height ? "landscape" : "portrait" : "auto";
  const mediaRefs = new Map();
  for (const id of idOrder) mediaRefs.set(id, await getMedia(id, slug, client));
  const contentBlocks = [];
  for (const block of projectBlocks) {
    if (block._type === "textBlock") contentBlocks.push(block);
    else if (block._type === "imageBlock") {
      const asset = mediaRefs.get(block._legacyAssetId);
      if (asset) {
        const rest = { ...block }; delete rest._legacyAssetId;
        const mediaUrl = assetById.get(block._legacyAssetId)?.url || localFor(block._legacyAssetId, slug) || "";
        if (/\.gif(?:\?|$)/i.test(mediaUrl) || /\.gif$/i.test(mediaUrl)) contentBlocks.push({ _type: "mediaBlock", _key: block._key, media: { _type: "file", asset: ref(asset) }, alt: "", caption: "" });
        else contentBlocks.push({ ...rest, ...(typeof rest.alt === "string" ? { alt: localized(rest.alt, rest.alt) } : {}), ...(typeof rest.caption === "string" ? { caption: localized(rest.caption, rest.caption) } : {}), image: imageField(asset) });
      }
    }
    else if (block._type === "mediaBlock") {
      const asset = block._legacyAssetId ? mediaRefs.get(block._legacyAssetId) : undefined;
      const rest = { ...block }; delete rest._legacyAssetId;
      if (asset) contentBlocks.push({ ...rest, ...(typeof rest.alt === "string" ? { alt: localized(rest.alt, rest.alt) } : {}), ...(typeof rest.caption === "string" ? { caption: localized(rest.caption, rest.caption) } : {}), media: { _type: "file", asset: ref(asset) } });
      else if (block.externalUrl) contentBlocks.push(rest);
    }
    else { const images = []; for (const entry of block.images) { const asset = mediaRefs.get(entry._legacyAssetId); if (asset) { const rest = { ...entry }; delete rest._legacyAssetId; images.push({ ...rest, ...(typeof rest.alt === "string" ? { alt: localized(rest.alt, rest.alt) } : {}), ...(typeof rest.caption === "string" ? { caption: localized(rest.caption, rest.caption) } : {}), image: imageField(asset) }); } } if (images.length) contentBlocks.push({ ...block, images }); }
  }
  const titleLocalized = localized(ptProjectTitles.get(slug), title);
  const artwork = withFingerprint({ _id: artworkId, _type: "artwork", title: titleLocalized, slug: { _type: "slug", current: slug }, ...(year ? { year } : {}), description: localized(summary.pt, summary.en), images: [{ _type: "imageEntry", _key: "cover", image: imageField(coverRef), alt: titleLocalized }], coverImage: imageField(coverRef), categories: category ? [category] : [], status: "archive", project: ref(projectIdValue), legacyUrl: `https://jhowars.com/${slug}`, altText: titleLocalized, notes: "Registro inicial baseado na imagem de capa do projeto. O inventário legado não identifica títulos individuais para as demais imagens; consulte os blocos do projeto para a sequência visual completa." });
  const relatedArtworkIds = [artworkId];
  for (const [extraIndex, id] of (additionalProjectImages.get(slug) || []).entries()) {
    const extraAsset = mediaRefs.get(id);
    const extraArtworkId = `legacy-artwork-${slug}-${slug.startsWith("posters-") ? "09" : "10"}`;
    if (extraAsset) {
      relatedArtworkIds.push(extraArtworkId);
      records.push(withFingerprint({ _id: extraArtworkId, _type: "artwork", title: titleLocalized, slug: { _type: "slug", current: `${slug}-image-${extraIndex + 2}` }, ...(year ? { year } : {}), ...(category ? { categories: [category] } : {}), images: [{ _type: "imageEntry", _key: "image", image: imageField(extraAsset), alt: titleLocalized }], coverImage: imageField(extraAsset), status: "archive", project: ref(projectIdValue), legacyUrl: `https://jhowars.com/${slug}`, altText: titleLocalized, notes: "Segunda imagem associada ao cartão deste projeto no inventário legado. O material não identifica um título individual nem confirma se é uma obra independente." }));
    }
  }
  const project = withFingerprint({ _id: projectIdValue, _type: "project", title: titleLocalized, slug: { _type: "slug", current: slug }, ...(year ? { year } : {}), ...(category ? { category: localized(category, categoryEnglish.get(category) || category) } : {}), coverImage: imageField(coverRef), ...(summary.pt || summary.en ? { summary: localized(summary.pt, summary.en) } : {}), legacyUrl: `https://jhowars.com/${slug}`, artworks: relatedArtworkIds.map((id, index) => arrayRef(id, `artwork-${index}`)), contentBlocks });
  const [hoverBackgroundColor, hoverTextColor] = hoverPairs[projectIndex];
  const home = withFingerprint({ _id: `legacy-home-${slug}`, _type: "homePost", internalName: title, enabled: true, image: imageField(coverRef), orientation, sizeHint: "auto", artwork: ref(artworkId), project: ref(projectIdValue), modalTitle: titleLocalized, ...(year ? { year } : {}), description: localized(summary.pt, summary.en), modalGallery: [{ _type: "imageEntry", _key: "cover", image: imageField(coverRef), alt: titleLocalized }], altText: titleLocalized, hoverBackgroundColor, hoverTextColor });
  records.push(project, artwork, home);
}

const bio = [
  "Sou Jhow.ars, ilustrador e designer, um alter ego do Jhonatan Rafael. Este é um projeto autoral onde arte e design se encontram em experimentação constante, entre o manual e o digital, entre obras únicas e séries que se desdobram em diferentes formatos.",
  "O trabalho nasce da minha vivência, da observação do cotidiano e de um imaginário atravessado pelo Brasil, pela art naïf e pela exploração de formas, cores e narrativas visuais que surgem da vontade de criar e contar histórias por imagem.",
  "Parte desse processo acontece em diálogo com outros artistas, no Grafatório e no coletivo Mãos Sujas, em Londrina, onde a impressão artesanal, a troca e o fazer coletivo também alimentam e expandem esse universo em construção.",
].join("\n\n");
const bioEn = [
  "I am Jhow.ars, an illustrator and designer, an alter ego of Jhonatan Rafael. This is an authorial project where art and design meet in constant experimentation, between the handmade and the digital, between unique works and series that unfold across different formats.",
  "My work grows from my lived experience, observing everyday life, and an imagination shaped by Brazil, art naïf, and the exploration of forms, colors, and visual narratives that arise from the desire to create and tell stories through images.",
  "Part of this process happens in dialogue with other artists, at Grafatório and in the Mãos Sujas collective, in Londrina, where handmade printing, exchange, and collective making also nourish and expand this universe in progress.",
].join("\n\n");
const circulationTranslations = [
  "A collective focused on graphic art and handmade printing.",
  "A graphic culture gathering organized since 2014 by Mário de Andrade Library and Editora Lote 42.",
  "A graphic art and handmade printing fair organized by SESC São Paulo in partnership with Editora Lote 42.",
  "A graphic art, literature, craft, and independent publishing fair organized by Gloriosa Cultural, with support from MinC and Petrobras.",
  "A printmaking festival organized by Grafatório.",
  "A recurring, more intimate version of Festival Dobra, held at Grafatório.",
  "A creative, collaborative gathering of independent artists and producers.",
  "An event focused on authorial and independent illustration.",
];
const about = withFingerprint({ _id: "about-page", _type: "aboutPage", bio: localized(bio, bioEn), circulation: [
  { _type: "circulationItem", _key: "maos-sujas", name: "Mãos Sujas", organization: "Grafatório", city: "Londrina", description: localized("Coletivo de arte gráfica e impressão artesanal", circulationTranslations[0]) },
  { _type: "circulationItem", _key: "miolos", name: "Miolo(s)", organization: "Editora Lote 42", city: "São Paulo", state: "SP", years: [2024, 2025], description: localized("Encontro de cultura gráfica promovido desde 2014 pela biblioteca mário de andrade e pela editora lote 42.", circulationTranslations[1]) },
  { _type: "circulationItem", _key: "printa-feira", name: "Printa-Feira", organization: "SESC São Paulo / Editora Lote 42", city: "São Paulo", state: "SP", years: [2025], description: localized("Feira de arte gráfica e processos de impressão artesanal, realizada pelo SESC São Paulo em parceria com a Editora Lote 42.", circulationTranslations[2]) },
  { _type: "circulationItem", _key: "mamute", name: "Mamute", organization: "Gloriosa Cultural", city: "Curitiba", state: "PR", years: [2025], description: localized("Feira de arte gráfica, literária, artesanal e autoral, realizada pela Gloriosa Cultural, com apoio do MinC e da Petrobras.", circulationTranslations[3]) },
  { _type: "circulationItem", _key: "festival-dobra", name: "Festival Dobra", organization: "Grafatório", city: "Londrina", state: "PR", years: [2023, 2024, 2025], description: localized("Festival de arte impressa promovido pelo Grafatório.", circulationTranslations[4]) },
  { _type: "circulationItem", _key: "mini-dobra", name: "Mini Dobra", organization: "Grafatório", city: "Londrina", state: "PR", years: [2023, 2024, 2025], description: localized("Versão recorrente e intimista do Festival Dobra, realizada no Grafatório.", circulationTranslations[5]) },
  { _type: "circulationItem", _key: "feira-goma", name: "Feira Goma", city: "Londrina", state: "PR", years: [2025], description: localized("Encontro criativo e coletivo de artistas e produtores independentes.", circulationTranslations[6]) },
  { _type: "circulationItem", _key: "encontro-ilustre", name: "Encontro Ilustre", city: "Londrina", state: "PR", years: [2024, 2025], description: localized("Evento voltado à ilustração autoral e independente.", circulationTranslations[7]) },
], additionalSections: [
  { _type: "object", _key: "base", heading: localized("Base", "Based"), body: localized("Base em Londrina - 2023 – atual", "Based in Londrina — 2023–present") },
  { _type: "object", _key: "contact", heading: localized("Contato (texto legado)", "Contact (legacy copy)"), body: localized("Este é um lugar de experimentação e processo. Se algo aqui te atravessou e virou ideia, projeto ou vontade de colaboração, o caminho começa por um e-mail.", "This is a place for experimentation and process. If something here resonated with you and became an idea, a project, or a desire to collaborate, the path begins with an email.") },
  { _type: "object", _key: "site-details", heading: localized("Informações do site (texto legado)", "Site information (legacy copy)"), body: localized("Based in: Brasil\nDisponível para: colaborações, parcerias e projetos com identidade autoral", "Based in: Brazil\nAvailable for: collaborations, partnerships and projects with a distinct identity") },
] });
const settings = withFingerprint({ _id: "site-settings", _type: "siteSettings", artistName: "Jhow.ars", artistSubtitle: localized("ARTISTA VISUAL E ILUSTRADOR", "VISUAL ARTIST & ILLUSTRATOR"), locationLabel: localized("Brasil", "Brazil"), footerAvailability: localized("Disponível para: colaborações, parcerias e projetos com identidade autoral", "Available for: collaborations, partnerships and projects with a distinct identity"), email: "jhow@jhowars.com", instagram: "https://www.instagram.com/jhow.ars/", behance: "https://www.behance.net/Jhonatanraff", linkedin: "https://www.linkedin.com/in/jhonatanrafaelars", seoTitle: localized("Jhow.ars — Artista visual, ilustração e design editorial", "Jhow.ars — Visual Artist, Illustration & Editorial Design"), seoDescription: localized("Portfólio de Jhow.ars, artista visual e designer com foco em ilustração, edições impressas, livros de artista, zines e projetos visuais experimentais.", "Visual artist and designer focused on illustration, print editions, art books, zines and experimental visual projects. Authorial portfolio by Jhow.ars.") });
records.push(about, settings);

const recordIds = new Set(records.map((record) => record._id));
if (recordIds.size !== records.length) throw new Error("Pré-validação falhou: IDs de documentos repetidos no seed.");
const mediaAssetIds = new Set(uploadedAssets.values());
function validateReferences(value) {
  if (Array.isArray(value)) { for (const item of value) validateReferences(item); return; }
  if (!value || typeof value !== "object") return;
  if (value._type === "reference" && value._ref) {
    const available = mediaAssetIds.has(value._ref) || recordIds.has(value._ref);
    if (!available) throw new Error(`Pré-validação falhou: referência sem destino ${value._ref}.`);
  }
  for (const child of Object.values(value)) validateReferences(child);
}
for (const record of records) validateReferences(record);

if (dryRun) {
  const homeOrientation = records.filter((record) => record._type === "homePost").reduce((counts, record) => ({ ...counts, [record.orientation]: (counts[record.orientation] || 0) + 1 }), {});
  const projectBlocks = records.filter((record) => record._type === "project").reduce((sum, record) => sum + (record.contentBlocks?.length || 0), 0);
  const flaggedNotes = ["Essa versão comunica cliente + edição + temas + problema editorial + sua solução visual sem virar textão.", "Esse texto funciona bem no ponto em que você sai das artes isoladas e começa a mostrar as páginas e duplas."].filter((text) => contentSource.includes(text));
  for (const [slug, title] of projectMetadata) console.log(`CREATE/UPDATE project + artwork + homePost: ${title} (${slug})`);
  console.log("CREATE/UPDATE about-page e site-settings; shopItem: nenhum (nenhum produto confiável foi identificado no legado).");
  console.log(`Prévia total: 8 projetos, ${records.filter((record) => record._type === "artwork").length} artworks (8 capas + 2 imagens secundárias identificadas), 8 HomePosts, 1 About, 1 SiteSettings, 0 ShopItems; ${projectBlocks} blocos de conteúdo em projetos detalhados.`);
  console.log(`Validação local: ${records.length} IDs de documentos únicos; referências de projeto, artwork, HomePost e mídia resolvem dentro do plano do seed.`);
  console.log(`Assets referenciados: ${uploadedAssets.size} IDs únicos; ${imageCount} imagens, ${gifCount} GIF${gifCount === 1 ? "" : "s"} e ${missingAssets.size} referências sem URL/arquivo no inventário.`);
  console.log(`Orientações de capa detectadas de arquivos locais: ${JSON.stringify(homeOrientation)}. Notas internas publicadas excluídas do conteúdo migrado: ${flaggedNotes.length}.`);
  console.log("Deduplicação exata por SHA-256: executada no modo de gravação; dry-run não baixa os arquivos CDN.");
  console.log("DRY-RUN: nenhuma conexão de escrita nem alteração remota realizada.");
  process.exit(0);
}
let created = 0, updated = 0, adopted = 0, skipped = 0;
const newlyCreated = new Set();
for (const desired of records) {
  const current = await client.getDocument(desired._id);
  if (current) continue;
  const skeleton = { ...desired };
  delete skeleton.migrationFingerprint;
  for (const field of ["artworks", "artwork", "project"]) delete skeleton[field];
  await client.createIfNotExists(skeleton);
  newlyCreated.add(desired._id);
  created++;
}
for (const desired of records) {
  const current = await client.getDocument(desired._id);
  if (newlyCreated.has(desired._id)) {
    const complete = { ...desired }; delete complete._id; delete complete._type;
    await client.patch(desired._id).set(complete).commit();
    continue;
  }
  const currentContent = { ...(current || {}) }; delete currentContent._rev; delete currentContent._createdAt; delete currentContent._updatedAt;
  if (!current) throw new Error(`Documento não encontrado após criação: ${desired._id}`);
  if (!current.migrationFingerprint) {
    if (/^legacy-(?:project|artwork)-/.test(desired._id) || desired._id === "site-settings") {
      const missing = Object.fromEntries(Object.entries(desired).filter(([key]) => !["_id", "_type", "migrationFingerprint"].includes(key)));
      await client.patch(desired._id).setIfMissing(missing).commit(); adopted++;
      console.log(`ADOPTED WITH SET-IF-MISSING (valores existentes preservados): ${desired._id}`);
    } else { skipped++; console.log(`IGNORED (documento sem marca de migração): ${desired._id}`); }
    continue;
  }
  if (fingerprint(currentContent) !== current.migrationFingerprint) { skipped++; console.log(`IGNORED (documento editado após a migração): ${desired._id}`); continue; }
  if (current.migrationFingerprint === desired.migrationFingerprint) { skipped++; continue; }
  const update = { ...desired }; delete update._id; delete update._type;
  await client.patch(desired._id).set(update).commit(); updated++;
}
console.log(`Migração finalizada: ${created} criados, ${updated} atualizados, ${adopted} documentos legados completados por setIfMissing, ${skipped} ignorados; ${imageCount} imagens, ${gifCount} GIF${gifCount === 1 ? "" : "s"}, ${duplicateCount} duplicatas por SHA-256 evitadas; ${missingAssets.size} assets ausentes.`);
if (missingAssets.size) console.log(`Assets ausentes: ${[...missingAssets].join("; ")}`);
