import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !dataset || !token) {
  console.error("Set the Sanity project, dataset, and token in .env.local before running this audit.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", useCdn: false });
const legacy = JSON.parse(readFileSync(new URL("../data/legacy-project-layouts.json", import.meta.url), "utf8"));
const legacyById = new Map();
const legacyAssetsText = readFileSync(new URL("../docs/legacy/assets.md", import.meta.url), "utf8");
for (const line of legacyAssetsText.split(/\r?\n/)) {
  if (!line.startsWith("|") || !line.includes("_rw_") && !line.includes("_rwc_")) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  const sourceId = cells[2]?.match(/([0-9a-f-]{36})/i)?.[1];
  const sourceUrl = cells[6]?.match(/`(https?:\/\/[^`]+)`/)?.[1];
  const legacyWidth = Number(cells[5]?.match(/(\d+)w/)?.[1]) || undefined;
  if (sourceId) legacyById.set(sourceId, { legacyWidth, url: sourceUrl });
}
for (const project of legacy.projects || []) {
  for (const legacyModule of project.modules || []) {
    for (const image of legacyModule.images || []) legacyById.set(image.id, { projectSlug: project.slug, moduleIndex: legacyModule.index, legacyWidth: image.width, aspectRatio: image.aspectRatio, url: image.largestSrcset || image.url });
  }
}

const query = `*[_type == "project"]{_id,"slug":slug.current,title,contentBlocks[]{_key,_type,widthStyle,"imageAsset":image.asset->{_id,originalFilename,metadata{dimensions{width,height}}},"leftAsset":leftImage.asset->{_id,originalFilename,metadata{dimensions{width,height}}},"rightAsset":rightImage.asset->{_id,originalFilename,metadata{dimensions{width,height}}},images[]{_key,"asset":image.asset->{_id,originalFilename,metadata{dimensions{width,height}}}}}}`;
try {
  const projects = await client.fetch(query);
  const rows = [];
  for (const project of projects) {
    for (const [blockIndex, block] of (project.contentBlocks || []).entries()) {
      const assets = [
        ["image", block.imageAsset], ["leftImage", block.leftAsset], ["rightImage", block.rightAsset],
        ...(block.images || []).map((entry, index) => [`gallery[${index}]`, entry.asset]),
      ];
      for (const [position, asset] of assets) {
        if (!asset?._id) continue;
        const sourceId = asset.originalFilename?.match(/^([0-9a-f-]{36})_rw_/i)?.[1];
        const source = sourceId ? legacyById.get(sourceId) : null;
        rows.push({ project: project.slug, title: project.title?.pt || project.title?.en || project._id, block: block._key || blockIndex, blockIndex, type: block._type, widthStyle: block.widthStyle, position, assetId: asset._id, filename: asset.originalFilename, currentWidth: asset.metadata?.dimensions?.width, currentHeight: asset.metadata?.dimensions?.height, legacyId: sourceId || null, legacyWidth: source?.legacyWidth || null, sourceUrl: source?.url || null });
      }
    }
  }
  const matched = rows.filter((row) => row.legacyWidth);
  const lower = matched.filter((row) => row.currentWidth && row.currentWidth < row.legacyWidth);
  const wideSourceLimits = rows.filter((row) => ["imageBlock", "fullWidthImageBlock"].includes(row.type) && ["full", "large", undefined].includes(row.widthStyle) && row.currentWidth && row.currentWidth < 1600);
  const byProject = Object.groupBy(lower, (row) => row.project);
  const projectCounts = Object.fromEntries(projects.map((project) => [project.slug, rows.filter((row) => row.project === project.slug).length]));
  console.log(JSON.stringify({ projectCount: projects.length, imageReferences: rows.length, deduplicatedAssetIds: new Set(rows.map((row) => row.assetId)).size, imageReferencesByProject: projectCounts, sourceMatches: matched.length, belowDeclaredSrcsetWidthCount: lower.length, belowDeclaredSrcsetWidth: Object.fromEntries(Object.entries(byProject).map(([slug, items]) => [slug, items.map(({ block, type, position, assetId, currentWidth, currentHeight, legacyWidth, legacyId, sourceUrl }) => ({ block, type, position, assetId, currentWidth, currentHeight, declaredMaxSrcsetWidth: legacyWidth, legacyId, sourceUrl }))])), wideSourceLimits: wideSourceLimits.map(({ project, title, blockIndex, type, widthStyle, filename, currentWidth, currentHeight, assetId, legacyId, sourceUrl }) => ({ project, title, blockIndex, type, widthStyle, filename, currentWidth, currentHeight, assetId, legacyId, sourceUrl })) }, null, 2));
} catch {
  console.error("Sanity query failed; response details suppressed.");
  process.exitCode = 1;
}
