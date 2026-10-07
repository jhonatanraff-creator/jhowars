import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
if (existsSync(path.join(root, ".env.local"))) {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const manifest = JSON.parse(readFileSync(path.join(root, "data/legacy-project-layouts.json"), "utf8"));
const commit = process.argv.includes("--commit");
const dryRun = !commit;
const allowProduction = process.argv.includes("--allow-production");
const confirmed = process.env.SANITY_PROJECT_LAYOUT_MIGRATION_CONFIRM === "YES";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
const client = projectId && dataset && token ? createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false }) : null;
const adobeEmbedUrl = "https://www-ccv.adobe.io/v1/player/ccv/PdFYgJJp4cy/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View";
const aliasesByLegacyId = new Map([["a1f9bafc-ff53-40b5-9f4b-f38d469bd659", "second.jpg"]]);
const summary = { mode: dryRun ? "dry-run" : "commit", dataset: dataset || "NÃO CONFIGURADO", projects: [], imageReferences: 0, collectionBlocks: 0, textBlocks: 0, videos: 0, unresolvedAssets: [], missingProjects: [], warnings: [] };

function fingerprint(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function deterministicKey(slug, index, suffix = "block") { return `${slug.slice(0, 10)}-${index}-${suffix}`.slice(0, 48); }
function ref(assetId) { return { _type: "reference", _ref: assetId }; }
function imageReference(assetId) { return { _type: "image", asset: ref(assetId) }; }

function mergeLocalized(first, second) {
  return {
    heading: { pt: first?.heading?.pt || second?.heading?.pt || "", en: first?.heading?.en || second?.heading?.en || "" },
    body: { pt: first?.body?.pt || second?.body?.pt || "", en: first?.body?.en || second?.body?.en || "" },
  };
}

function sourceTextBlock(slug, sourceModule) {
  const localized = sourceModule.localized || { heading: {}, body: {} };
  return {
    _key: deterministicKey(slug, sourceModule.index), _type: "textBlock",
    heading: { pt: localized.heading?.pt || "", en: localized.heading?.en || "" },
    body: { pt: localized.body?.pt || "", en: localized.body?.en || "" },
    widthStyle: "medium", alignment: sourceModule.alignment === "left" || sourceModule.alignment === "right" ? sourceModule.alignment : "center",
    spacingTop: "medium", spacingBottom: "medium",
  };
}

function imageSourceId(image) { return image.id || image.url.match(/[a-f0-9]{8}-[a-f0-9-]{27,}/i)?.[0]; }

function modulesToPlan(page, document, byLegacyId, byFilename) {
  const modules = page.modules;
  const blocks = [];
  const pairedFogoIndices = new Set([2, 5, 13]);
  for (let position = 0; position < modules.length; position += 1) {
    const sourceModule = modules[position];
    if (sourceModule.type === "text") {
      let localized = sourceModule.localized;
      if (page.slug === "fogo-fossil" && [1, 4, 12].includes(sourceModule.index)) {
        const paired = modules[position + 1];
        if (paired?.type !== "text" || !pairedFogoIndices.has(paired.index)) throw new Error(`Par EN/PT quebrado no índice ${sourceModule.index} de ${page.slug}`);
        localized = mergeLocalized(sourceModule.localized, paired.localized);
        position += 1;
      }
      blocks.push(sourceTextBlock(page.slug, { ...sourceModule, localized }));
      continue;
    }
    if (sourceModule.type === "image" || sourceModule.type === "mediaCollection") {
      const resolvedImages = sourceModule.images.map((image, imageIndex) => {
        const legacyId = imageSourceId(image);
        const asset = byLegacyId.get(legacyId) || byFilename.get(aliasesByLegacyId.get(legacyId));
        if (!asset) summary.unresolvedAssets.push({ project: page.slug, module: sourceModule.index, image: imageIndex, legacyId, filename: path.basename(String(image.url).split(/[?#]/)[0]) });
        summary.imageReferences += 1;
        return { legacyId, assetId: asset?._id, alt: image.alt || "" };
      });
      if (sourceModule.type === "mediaCollection") {
        summary.collectionBlocks += 1;
        blocks.push({
          _key: deterministicKey(page.slug, sourceModule.index, "collection"), _type: "galleryBlock",
          images: resolvedImages.map((item, imageIndex) => ({ _key: deterministicKey(page.slug, sourceModule.index, `image-${imageIndex}`), _type: "imageEntry", image: imageReference(item.assetId || "unresolved"), alt: { pt: item.alt, en: item.alt }, caption: { pt: "", en: "" } })),
          layout: "grid", columnsDesktop: resolvedImages.length >= 8 ? 5 : 3, columnsTablet: 2, columnsMobile: 1,
          gap: "small", widthStyle: "full", alignment: "center", spacingTop: "medium", spacingBottom: "medium",
        });
      } else {
        const item = resolvedImages[0];
        blocks.push({
          _key: deterministicKey(page.slug, sourceModule.index), _type: "imageBlock", image: imageReference(item?.assetId || "unresolved"),
          alt: { pt: item?.alt || "", en: item?.alt || "" }, caption: { pt: "", en: "" }, widthStyle: "full",
          alignment: "center", spacingTop: "small", spacingBottom: "small",
        });
      }
      continue;
    }
    if (sourceModule.type === "video") {
      summary.videos += 1;
      const filenameAsset = byFilename.get("PdFYgJJp4cy_576.mp4");
      blocks.push({
        _key: deterministicKey(page.slug, sourceModule.index, "video"), _type: "mediaBlock",
        ...(filenameAsset ? { media: { _type: "file", asset: ref(filenameAsset._id) } } : { externalUrl: adobeEmbedUrl }),
        alt: { pt: "", en: "" }, caption: { pt: "", en: "" }, widthStyle: "full", alignment: "center", spacingTop: "medium", spacingBottom: "medium",
      });
    }
  }
  summary.textBlocks += blocks.filter((block) => block._type === "textBlock").length;
  const sourceFingerprint = fingerprint({ slug: page.slug, modules: page.modules.map((sourceModule) => ({
    index: sourceModule.index, type: sourceModule.type, imageIds: sourceModule.images.map(imageSourceId), text: sourceModule.localized,
    media: sourceModule.media.map((item) => item.src), groupSizes: sourceModule.groupSizes,
  })) });
  const related = (page.relatedSlugs || []).filter((slug) => slug !== page.slug && projectSlugs.includes(slug)).slice(0, 3);
  const relatedReferences = related.map((slug) => {
    const target = documentsBySlug.get(slug);
    return target ? { _key: deterministicKey(page.slug, related.indexOf(slug), "related"), _type: "reference", _ref: target._id } : null;
  }).filter(Boolean);
  return { blocks, sourceFingerprint, relatedSlugs: related, relatedReferences, document };
}

function safeError(error) {
  let message = String(error?.message || error || "Erro desconhecido");
  if (token) message = message.replaceAll(token, "[credencial omitida]");
  return message.replace(/Bearer\s+[^\s"']+/gi, "Bearer [credencial omitida]").slice(0, 320);
}

if (!client) {
  console.error("Configuração Sanity incompleta: confira as variáveis locais necessárias. Valores secretos não são exibidos.");
  process.exit(1);
}
if (commit && dataset === "production" && !allowProduction) {
  console.error("Gravação em production recusada: informe --allow-production e a confirmação explícita.");
  process.exit(1);
}
if (commit && !confirmed) {
  console.error("Gravação recusada: defina SANITY_PROJECT_LAYOUT_MIGRATION_CONFIRM=YES após revisar o dry-run.");
  process.exit(1);
}

let documentsBySlug;
try {
  const [documents, assets] = await Promise.all([
    client.fetch(`*[_type == "project"]{_id,"slug":slug.current,showInProjects,archiveOrder,legacyLayoutFingerprint}`),
    client.fetch(`*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{_id,_type,originalFilename,sha256hash}`),
  ]);
  documentsBySlug = new Map(documents.map((document) => [document.slug, document]));
  const byLegacyId = new Map();
  const byFilename = new Map();
  const byHash = new Map();
  for (const asset of assets) {
    if (asset.originalFilename) byFilename.set(asset.originalFilename, asset);
    if (asset.sha256hash && !byHash.has(asset.sha256hash)) byHash.set(asset.sha256hash, asset);
  }
  for (const asset of assets) {
    const match = asset.originalFilename?.match(/[a-f0-9]{8}-[a-f0-9-]{27,}/i);
    if (match) byLegacyId.set(match[0], (asset.sha256hash && byHash.get(asset.sha256hash)) || asset);
  }

  const legacyAssetRows = readFileSync(path.join(root, "docs/legacy/assets.md"), "utf8").split(/\r?\n/).filter((line) => /^\| (?:BRAND|PROJECT IMAGE|ARTWORK|EDITORIAL|MOCKUP|PROCESS|PHOTO|GIF|ICON|UNKNOWN) \|/.test(line));
  for (const line of legacyAssetRows) {
    const cells = line.split("|").map((part) => part.trim());
    const legacyId = cells[3]?.match(/[a-f0-9]{8}-[a-f0-9-]{27,}/i)?.[0];
    const localPath = cells[8]?.match(/public\/[^`\s]+/)?.[0];
    if (!legacyId || !localPath || byLegacyId.has(legacyId)) continue;
    const absolutePath = path.join(root, localPath.replaceAll("/", path.sep));
    if (!existsSync(absolutePath)) continue;
    const hash = createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
    if (byHash.has(hash)) byLegacyId.set(legacyId, byHash.get(hash));
  }

  let missingDocument = false;
  const plans = manifest.projects.map((page) => {
    const document = documentsBySlug.get(page.slug);
    if (!document) { summary.missingProjects.push(page.slug); missingDocument = true; return null; }
    // The cover asset was uploaded by the first migration with a local fallback name.
    return modulesToPlan(page, document, byLegacyId, byFilename);
  }).filter(Boolean);

  summary.projects = plans.map((plan) => {
    const document = plan.document;
    const blockFingerprint = plan.sourceFingerprint;
    const state = document.legacyLayoutFingerprint === blockFingerprint ? "NO-OP (fingerprint igual)" : document.legacyLayoutFingerprint ? "IGNORADO (fingerprint diferente; revisão necessária)" : "ATUALIZA contentBlocks / relatedProjects / contentLayout";
    return { slug: document.slug, legacyModules: manifest.projects.find((page) => page.slug === document.slug).moduleCount, cmsBlocks: plan.blocks.length, relatedProjects: plan.relatedSlugs, state };
  });

  if (summary.unresolvedAssets.length) summary.warnings.push("Assets sem correspondência em sanity.imageAsset/fileAsset; a migração não enviará cópias e a gravação será bloqueada.");
  if (summary.missingProjects.length) summary.warnings.push("Documentos de projeto ausentes; nenhuma criação ou exclusão será feita.");
  console.log(JSON.stringify(summary, null, 2));

  if (!dryRun) {
    if (missingDocument || summary.unresolvedAssets.length) {
      console.error("Migração bloqueada: resolva projetos ou assets ausentes antes de gravar. Nenhum documento foi alterado.");
      process.exit(2);
    }
    for (const plan of plans) {
      if (plan.document.legacyLayoutFingerprint === plan.sourceFingerprint) continue;
      if (plan.document.legacyLayoutFingerprint) {
        console.warn(`Documento ${plan.document.slug} preservado: fingerprint anterior difere; nenhuma alteração aplicada.`);
        continue;
      }
      const patch = client.patch(plan.document._id).set({
        contentBlocks: plan.blocks,
        contentLayout: "editorial-sequence",
        relatedProjects: plan.relatedReferences,
        legacyLayoutFingerprint: plan.sourceFingerprint,
      });
      await patch.commit({ tag: "legacy-project-layout-migration" });
      console.log(`Atualizado: ${plan.document.slug}`);
    }
  }
} catch (error) {
  console.error(`Migração interrompida: ${safeError(error)}`);
  process.exit(1);
}
