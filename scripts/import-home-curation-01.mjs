import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const commit = process.argv.includes("--commit");
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
const manifest = JSON.parse(readFileSync("data/home-curation-01.json", "utf8"));
const sourceDirectory = process.env.JHOW_HOME_CURATION_DIR || manifest.sourceDirectory;

if (!projectId || !dataset || !token) {
  console.error("Set the Sanity project, dataset, and token in .env.local before running this import.");
  process.exit(1);
}
if (commit && (!allowProduction || (dataset === "production" && process.env.HOME_CURATION_01_CONFIRM !== "YES"))) {
  console.error("Writes require --allow-production and HOME_CURATION_01_CONFIRM=YES for the production dataset.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion, useCdn: false });
const sha = (file, algorithm) => createHash(algorithm).update(readFileSync(file)).digest("hex");
const ref = (id) => ({ _type: "reference", _ref: id });
const localizedString = (value) => ({ _type: "localizedString", ...value });
const localizedText = (value) => ({ _type: "localizedText", ...value });
const imageRef = (assetId) => ({ _type: "image", asset: ref(assetId) });
const withKeys = (items, prefix) => items.map((item, index) => ({ ...item, _key: `${prefix}-${index + 1}` }));

try {
  const sourceFiles = manifest.posts.map((post) => {
    const file = path.join(sourceDirectory, post.sourceFile);
    if (!existsSync(file) || !statSync(file).isFile()) return { ...post, file, missing: true };
    return { ...post, file, sha256: sha(file, "sha256"), sha1: sha(file, "sha1"), bytes: statSync(file).size };
  });
  const duplicates = new Map();
  for (const item of sourceFiles) if (item.sha256) {
    const prior = duplicates.get(item.sha256);
    if (prior) item.duplicateOf = prior.number;
    else duplicates.set(item.sha256, item);
  }
  const directoryPngs = existsSync(sourceDirectory) ? readdirSync(sourceDirectory).filter((name) => /\.png$/i.test(name)).map((name) => ({ name, sha256: sha(path.join(sourceDirectory, name), "sha256") })) : [];
  const directoryByHash = new Map();
  const directoryDuplicates = [];
  for (const item of directoryPngs) {
    const original = directoryByHash.get(item.sha256);
    if (original) directoryDuplicates.push({ duplicate: item.name, sameAs: original });
    else directoryByHash.set(item.sha256, item.name);
  }
  const manifestNames = new Set(manifest.posts.map((post) => post.sourceFile));
  const unassignedDirectoryFiles = directoryPngs.filter((item) => !manifestNames.has(item.name)).map((item) => item.name);
  const uniqueFiles = sourceFiles.filter((item) => !item.missing && !item.duplicateOf);
  const [assets, artworks, homePosts, projects, settings] = await Promise.all([
    client.fetch(`*[_type == "sanity.imageAsset"]{_id,sha1hash}`),
    client.fetch(`*[_type == "artwork"]{_id,title,"slug":slug.current,images[]{_key,image{asset{_ref}},alt,caption},coverImage{asset{_ref}},year,technique,description,dimensions,project}`),
    client.fetch(`*[_type == "homePost"]{_id,internalName,"imageSha1":image.asset->sha1hash,image{asset{_ref}},modalGallery[]{image{asset{_ref}}},artwork{_ref},project{_ref}}`),
    client.fetch(`*[_type == "project"]{_id,"slug":slug.current,title}`),
    client.fetch(`*[_type == "siteSettings" && _id == "site-settings"][0]{_id,shopEnabled}`),
  ]);

  const assetBySha1 = new Map(assets.filter((asset) => asset.sha1hash).map((asset) => [asset.sha1hash.toLowerCase(), asset._id]));
  const assetPlan = new Map();
  for (const item of uniqueFiles) assetPlan.set(item.number, { action: assetBySha1.has(item.sha1) ? "reuse" : "upload", assetId: assetBySha1.get(item.sha1) || null, sha256: item.sha256, bytes: item.bytes, file: item.file });
  for (const item of sourceFiles.filter((entry) => entry.duplicateOf)) assetPlan.set(item.number, { action: "reuse-source-duplicate", sourceNumber: item.duplicateOf, sha256: item.sha256 });

  const artworkPlans = [];
  const conflicts = [];
  for (const artwork of manifest.artworks) {
    const matches = artworks.filter((entry) => entry.slug === artwork.slug || entry._id.replace(/^drafts\./, "") === `artwork-curation-01-${artwork.slug}`);
    const sameTitle = artworks.filter((entry) => entry.title?.pt?.trim().toLocaleLowerCase("pt-BR") === artwork.title.toLocaleLowerCase("pt-BR"));
    const distinctMatches = [...new Map([...matches, ...sameTitle].map((entry) => [entry._id.replace(/^drafts\./, ""), entry])).values()];
    if (distinctMatches.length > 1) conflicts.push({ type: "artwork", slug: artwork.slug, documentIds: distinctMatches.map((entry) => entry._id) });
    const existing = distinctMatches[0];
    artworkPlans.push({ ...artwork, id: existing?._id.replace(/^drafts\./, "") || `artwork-curation-01-${artwork.slug}`, action: existing ? "update" : "create", existingId: existing?._id });
  }
  const postPlans = manifest.posts.map((post) => {
    const matches = homePosts.filter((entry) => entry.internalName === post.internalName || entry.imageSha1?.toLowerCase() === sourceFiles.find((source) => source.number === post.number)?.sha1 || entry._id.replace(/^drafts\./, "") === `homePost-curation-01-${String(post.number).padStart(2, "0")}`);
    const distinctMatches = [...new Map(matches.map((entry) => [entry._id.replace(/^drafts\./, ""), entry])).values()];
    if (distinctMatches.length > 1) conflicts.push({ type: "homePost", number: post.number, internalName: post.internalName, documentIds: distinctMatches.map((entry) => entry._id) });
    const existing = distinctMatches[0];
    return { ...post, id: existing?._id.replace(/^drafts\./, "") || `homePost-curation-01-${String(post.number).padStart(2, "0")}`, action: existing ? "update" : "create", existingId: existing?._id };
  });
  const projectPlans = manifest.posts.filter((post) => post.projectSlug).map((post) => {
    const matches = projects.filter((project) => project.slug === post.projectSlug);
    if (matches.length !== 1) conflicts.push({ type: "project", slug: post.projectSlug, matchCount: matches.length });
    return { slug: post.projectSlug, id: matches[0]?._id, title: matches[0]?.title?.pt || matches[0]?.title?.en };
  });
  const missingFiles = sourceFiles.filter((item) => item.missing).map(({ number, sourceFile, file }) => ({ number, sourceFile, file }));
  const existingArtAssetRefs = new Set(artworks.flatMap((item) => (item.images || []).map((entry) => entry.image?.asset?._ref).filter(Boolean)));
  const artworkImageCount = manifest.artworks.reduce((sum, item) => sum + item.images.length, 0);
  const galleries = Object.entries(manifest.galleryGroups).map(([name, numbers]) => ({ name, numbers, postCount: numbers.length }));
  const report = {
    mode: commit ? "commit" : "dry-run",
    connection: { projectId, dataset, apiVersion },
    sources: { directory: sourceDirectory, suppliedPngFiles: directoryPngs.length, uniquePngFiles: directoryByHash.size, directoryDuplicateFiles: directoryDuplicates, unassignedDirectoryFiles, listedFiles: sourceFiles.length, uniqueManifestFiles: uniqueFiles.length, localDuplicateFiles: sourceFiles.filter((item) => item.duplicateOf).map((item) => ({ sourceFile: item.sourceFile, duplicateOf: sourceFiles.find((entry) => entry.number === item.duplicateOf)?.sourceFile })), missingFiles },
    assets: { upload: [...assetPlan.values()].filter((item) => item.action === "upload").length, reuseExisting: [...assetPlan.values()].filter((item) => item.action === "reuse").length, reuseLocalDuplicate: [...assetPlan.values()].filter((item) => item.action === "reuse-source-duplicate").length, currentArtworkAssetReferences: existingArtAssetRefs.size },
    artworks: { total: artworkPlans.length, create: artworkPlans.filter((item) => item.action === "create").length, update: artworkPlans.filter((item) => item.action === "update").length, images: artworkImageCount, plans: artworkPlans.map(({ id, slug, title, action, images }) => ({ id, slug, title, action, imageCount: images.length })) },
    homePosts: { total: postPlans.length, create: postPlans.filter((item) => item.action === "create").length, update: postPlans.filter((item) => item.action === "update").length, enabled: postPlans.length, artworkReferences: postPlans.filter((item) => item.artworkSlug).length, projectReferences: postPlans.filter((item) => item.projectSlug).length, sharedGalleries: galleries },
    projects: projectPlans,
    siteSettings: { exists: Boolean(settings), shopEnabledBefore: settings?.shopEnabled ?? null, shopEnabledAfter: false },
    conflicts,
  };
  console.log(JSON.stringify(report, null, 2));
  if (missingFiles.length || conflicts.length) {
    console.error("Missing source files or ambiguous relationships found; no writes were performed.");
    process.exit(2);
  }
  if (!commit) {
    console.log("Dry run complete. No Sanity assets or documents were written.");
    process.exit(0);
  }
  if (!settings) throw new Error("Required site-settings singleton is missing; refusing to create a second settings document.");

  const uploaded = new Map([...assetPlan].filter(([, value]) => value.assetId).map(([number, value]) => [number, value.assetId]));
  for (const item of uniqueFiles) {
    const current = assetPlan.get(item.number);
    if (current.action === "reuse") continue;
    const result = await client.assets.upload("image", createReadStream(item.file), { filename: path.basename(item.file), contentType: "image/png" });
    uploaded.set(item.number, result._id);
    assetBySha1.set(item.sha1, result._id);
  }
  for (const item of sourceFiles.filter((entry) => entry.duplicateOf)) uploaded.set(item.number, uploaded.get(item.duplicateOf));

  const postByNumber = new Map(postPlans.map((post) => [post.number, post]));
  const artworkBySlug = new Map(artworkPlans.map((artwork) => [artwork.slug, artwork]));
  const postsByArtwork = new Map();
  for (const post of postPlans) if (post.artworkSlug) {
    if (!postsByArtwork.has(post.artworkSlug)) postsByArtwork.set(post.artworkSlug, []);
    postsByArtwork.get(post.artworkSlug).push(post);
  }
  const galleryByPostNumber = new Map();
  for (const numbers of Object.values(manifest.galleryGroups)) {
    const entries = numbers.map((number) => {
      const post = postByNumber.get(number);
      return { _type: "imageEntry", _key: `curation-${String(number).padStart(2, "0")}`, image: imageRef(uploaded.get(number)), alt: localizedString(post.altText) };
    });
    for (const number of numbers) galleryByPostNumber.set(number, entries);
  }

  const transaction = client.transaction();
  for (const artwork of artworkPlans) {
    const posts = postsByArtwork.get(artwork.slug) || [];
    const existingEntries = artwork.existingId ? (artworks.find((entry) => entry._id === artwork.existingId)?.images || []) : [];
    const byAsset = new Map(existingEntries.map((entry) => [entry.image?.asset?._ref, entry]));
    const entries = artwork.images.map((number, index) => {
      const sourcePost = postByNumber.get(number) || posts[index] || posts[0];
      const assetId = uploaded.get(number);
      const prior = byAsset.get(assetId);
      return { _type: "imageEntry", _key: prior?._key || `curation-${String(number).padStart(2, "0")}`, image: imageRef(assetId), alt: localizedString(sourcePost?.altText || {}), ...(prior?.caption ? { caption: prior.caption } : {}) };
    });
    const mergedImages = [...entries, ...existingEntries.filter((entry) => !entries.some((next) => next.image.asset._ref === entry.image?.asset?._ref))];
    const doc = {
      _id: artwork.id, _type: "artwork", title: localizedString({ pt: artwork.title, en: artwork.title }), slug: { _type: "slug", current: artwork.slug },
      ...(artwork.year ? { year: artwork.year } : {}), technique: localizedString(artwork.technique), description: localizedText(artwork.description),
      images: withKeys(mergedImages, `curation-${artwork.slug}`), coverImage: imageRef(uploaded.get(artwork.images[0])), status: "archive",
      altText: localizedString(posts[0]?.altText || {}), migrationFingerprint: "home-curation-01-v1",
      ...(artwork.dimensions ? { dimensions: artwork.dimensions } : {}),
    };
    if (artwork.projectSlug) {
      const projectId = projectPlans.find((item) => item.slug === artwork.projectSlug)?.id;
      if (projectId) doc.project = ref(projectId);
    }
    if (artwork.action === "create") transaction.createIfNotExists(doc);
    else transaction.patch(artwork.id, (patch) => patch.set(Object.fromEntries(Object.entries(doc).filter(([key]) => key !== "_id" && key !== "_type"))));
  }
  for (const post of postPlans) {
    const artworkId = post.artworkSlug ? artworkBySlug.get(post.artworkSlug)?.id : null;
    const projectId = post.projectSlug ? projectPlans.find((item) => item.slug === post.projectSlug)?.id : null;
    const customBackground = post.hoverBackgroundColor === "custom";
    const gallery = galleryByPostNumber.get(post.number) || [];
    const doc = {
      _id: post.id, _type: "homePost", internalName: post.internalName, enabled: true,
      image: imageRef(uploaded.get(post.number)), orientation: post.orientation, sizeHint: post.sizeHint,
      ...(artworkId ? { artwork: ref(artworkId) } : {}), ...(projectId ? { project: ref(projectId) } : {}),
      ...(post.modalTitle ? { modalTitle: localizedString(post.modalTitle) } : {}),
      ...(post.description ? { description: localizedText(post.description) } : {}), modalGallery: withKeys(gallery, `home-gallery-${post.number}`),
      altText: localizedString(post.altText), weight: post.weight, hoverBackgroundColor: post.hoverBackgroundColor,
      ...(customBackground ? { hoverBackgroundCustom: post.hoverBackgroundCustom } : {}), hoverTextColor: post.hoverTextColor,
      migrationFingerprint: "home-curation-01-v1",
    };
    if (post.action === "create") transaction.createIfNotExists(doc);
    else transaction.patch(post.id, (patch) => patch.set(Object.fromEntries(Object.entries(doc).filter(([key]) => key !== "_id" && key !== "_type"))).unset([...(artworkId ? [] : ["artwork"]), ...(projectId ? [] : ["project"]), ...(!customBackground ? ["hoverBackgroundCustom"] : []), ...(!post.modalTitle ? ["modalTitle"] : []), ...(!post.description ? ["description"] : [])]));
  }
  transaction.patch("site-settings", (patch) => patch.set({ shopEnabled: false }));
  const result = await transaction.commit();
  console.log(JSON.stringify({ written: true, transactionId: result.transactionId, imagesUploaded: uniqueFiles.filter((item) => assetPlan.get(item.number).action === "upload").length, imagesReused: uniqueFiles.filter((item) => assetPlan.get(item.number).action === "reuse").length, artworksCreated: artworkPlans.filter((item) => item.action === "create").length, artworksUpdated: artworkPlans.filter((item) => item.action === "update").length, homePostsCreated: postPlans.filter((item) => item.action === "create").length, homePostsUpdated: postPlans.filter((item) => item.action === "update").length, shopEnabled: false }, null, 2));
} catch {
  console.error("Home curation import failed; response details suppressed to avoid exposing credentials.");
  process.exitCode = 1;
}
