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
  console.error("Set Sanity project, dataset, and token in .env.local before verification.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync("data/home-curation-01.json", "utf8"));
const client = createClient({ projectId, dataset, token, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", useCdn: false });
const artworkIds = manifest.artworks.map((item) => `artwork-curation-01-${item.slug}`);
const postIds = manifest.posts.map((item) => `homePost-curation-01-${String(item.number).padStart(2, "0")}`);

try {
  const [artworks, posts, settings] = await Promise.all([
    client.fetch(`*[_id in $ids]{_id,_type,title,description,technique,images[]{_key,"assetId":image.asset._ref,"assetExists":defined(image.asset->_id),"width":image.asset->metadata.dimensions.width,alt,caption},coverImage{asset{_ref}},"coverExists":defined(coverImage.asset->_id)}`, { ids: artworkIds }),
    client.fetch(`*[_id in $ids]{_id,_type,internalName,enabled,orientation,sizeHint,weight,hoverBackgroundColor,hoverBackgroundCustom,hoverTextColor,altText,modalTitle,description,"imageAssetId":image.asset._ref,"imageExists":defined(image.asset->_id),"artworkId":artwork._ref,"artworkExists":defined(artwork->_id),"projectId":project._ref,"projectExists":defined(project->_id),modalGallery[]{"assetId":image.asset._ref,"assetExists":defined(image.asset->_id),alt}}`, { ids: postIds }),
    client.fetch(`*[_type == "siteSettings" && _id == "site-settings"][0]{shopEnabled}`),
  ]);
  const bySlug = new Map(artworks.map((item) => [item._id.replace("artwork-curation-01-", ""), item]));
  const byNumber = new Map(posts.map((item) => [Number(item._id.slice("homePost-curation-01-".length)), item]));
  const problems = [];
  for (const expected of manifest.artworks) {
    const doc = bySlug.get(expected.slug);
    if (!doc) { problems.push(`missing artwork ${expected.slug}`); continue; }
    if (doc.images.length < expected.images.length || doc.images.some((image) => !image.assetId || !image.assetExists)) problems.push(`unresolved artwork image ${expected.slug}`);
    if (!doc.coverExists) problems.push(`unresolved artwork cover ${expected.slug}`);
    if (!doc.title?.pt || !doc.title?.en || !doc.description?.pt || !doc.description?.en || !doc.technique?.pt || !doc.technique?.en) problems.push(`missing localized artwork fields ${expected.slug}`);
  }
  for (const expected of manifest.posts) {
    const doc = byNumber.get(expected.number);
    if (!doc) { problems.push(`missing HomePost ${expected.number}`); continue; }
    if (doc.enabled !== true || !doc.imageExists) problems.push(`disabled post or unresolved image ${expected.number}`);
    if (!doc.altText?.pt || !doc.altText?.en) problems.push(`missing localized alt ${expected.number}`);
    if (doc.orientation !== expected.orientation || doc.sizeHint !== expected.sizeHint || doc.weight !== expected.weight || doc.hoverTextColor !== expected.hoverTextColor || doc.hoverBackgroundColor !== expected.hoverBackgroundColor || (expected.hoverBackgroundColor === "custom" && doc.hoverBackgroundCustom !== expected.hoverBackgroundCustom)) problems.push(`curation field mismatch ${expected.number}`);
    if (expected.artworkSlug && (!doc.artworkExists || doc.artworkId !== `artwork-curation-01-${expected.artworkSlug}`)) problems.push(`artwork reference mismatch ${expected.number}`);
    if (expected.projectSlug && (!doc.projectExists || doc.projectId !== "legacy-project-veja-saude-editorial-illustration")) problems.push(`project reference mismatch ${expected.number}`);
    if (!expected.projectSlug && doc.projectId) problems.push(`unexpected project reference ${expected.number}`);
    const gallery = expected.galleryGroup ? manifest.galleryGroups[expected.galleryGroup] : [];
    if ((doc.modalGallery || []).length !== gallery.length || (doc.modalGallery || []).some((image) => !image.assetExists || !image.alt?.pt || !image.alt?.en)) problems.push(`gallery mismatch ${expected.number}`);
  }
  if (settings?.shopEnabled !== false) problems.push("shopEnabled is not false");
  const result = {
    projectId, dataset,
    artworks: { expected: artworkIds.length, found: artworks.length, images: artworks.reduce((sum, item) => sum + (item.images || []).length, 0), allAssetsResolved: artworks.every((item) => item.coverExists && (item.images || []).every((image) => image.assetExists)) },
    homePosts: { expected: postIds.length, found: posts.length, enabled: posts.filter((item) => item.enabled).length, artworkReferences: posts.filter((item) => item.artworkId).length, projectReferences: posts.filter((item) => item.projectId).length, assetsResolved: posts.every((item) => item.imageExists), galleryPosts: posts.filter((item) => item.modalGallery?.length).length, galleryImagesResolved: posts.every((item) => (item.modalGallery || []).every((image) => image.assetExists)) },
    shopEnabled: settings?.shopEnabled ?? null,
    problems,
  };
  console.log(JSON.stringify(result, null, 2));
  if (problems.length) process.exitCode = 2;
} catch {
  console.error("Sanity verification failed; response details suppressed.");
  process.exitCode = 1;
}
