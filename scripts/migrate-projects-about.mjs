import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(?:"(.*)"|'(.*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
  }
}

const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset, SANITY_API_TOKEN: token } = process.env;
if (!projectId || !dataset || !token) throw new Error("Sanity não configurado; confira as variáveis locais.");
const commit = process.argv.includes("--commit");
if (commit && (dataset !== "production" || !process.argv.includes("--allow-production") || process.env.PROJECTS_ABOUT_MIGRATION_CONFIRM !== "YES")) {
  throw new Error("Gravação bloqueada: use a confirmação e a flag de production.");
}

const mediaName = "bb44e357-725b-46a0-99ca-f989571752f7_rw_1200.gif";
const mediaPath = process.env.ABOUT_MEDIA_PATH;
const client = createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false, perspective: "published" });
const [projects, projectsPage, about] = await Promise.all([
  client.fetch(`*[_type == "project"] | order(year desc, title.pt asc){_id, archiveOrder, showInProjects}`),
  client.fetch(`*[_type == "projectsPage" && _id == "projects-page"][0]{_id, eyebrow, title}`),
  client.fetch(`*[_type == "aboutPage" && _id == "about-page"][0]{_id, creatorHeading, circulationHeading, intro, bio, "heroId": heroMedia.asset._ref, "heroFilename": heroMedia.asset->originalFilename}`),
]);
if (!about) throw new Error("aboutPage singleton ausente; nenhum dado foi alterado.");

let gifAsset = null;
if (mediaPath && existsSync(mediaPath)) {
  const digest = createHash("sha256").update(readFileSync(mediaPath)).digest("base64");
  gifAsset = await client.fetch(`*[_type == "sanity.fileAsset" && (originalFilename == $name || metadata.sha256hash == $sha)][0]{_id, originalFilename, url, "width": metadata.dimensions.width, "height": metadata.dimensions.height}`, { name: mediaName, sha: digest });
} else if (about.heroFilename === mediaName) {
  gifAsset = { _id: about.heroId, originalFilename: mediaName };
} else if (commit) {
  throw new Error("Arquivo GIF fornecido ausente no caminho local informado.");
}

const actions = [];
if (!projectsPage) actions.push("Criar singleton projectsPage com rótulos ARQUIVO/ARCHIVE e PROJETOS/PROJECTS.");
projects.forEach((project, index) => {
  if (project.archiveOrder == null || project.showInProjects == null) actions.push(`Preencher controles ausentes de ${project._id}: ordem ${project.archiveOrder ?? index + 1}, visível ${project.showInProjects ?? true}.`);
});
if (!about.creatorHeading?.pt || !about.creatorHeading?.en) actions.push("Preencher apenas idiomas ausentes do título de apresentação.");
if (!about.circulationHeading?.pt || !about.circulationHeading?.en) actions.push("Preencher apenas idiomas ausentes do título de circulação.");
const bioPt = about.bio?.pt?.split("\n\n").filter(Boolean) || [];
const bioEn = about.bio?.en?.split("\n\n").filter(Boolean) || [];
const splitBio = !about.intro?.pt?.trim() && !about.intro?.en?.trim() && bioPt.length > 1 && bioEn.length > 1;
if (splitBio) actions.push("Separar o primeiro parágrafo existente para intro e manter os demais em bio, sem alterar texto.");
if (about.heroFilename !== mediaName) actions.push(gifAsset ? "Reusar o GIF existente e associá-lo à mídia principal do About." : "Enviar o GIF do ZIP e associá-lo à mídia principal do About.");
console.log(JSON.stringify({ mode: commit ? "commit" : "dry-run", projectCount: projects.length, projectsPage: projectsPage ? "exists" : "will create", aboutId: about._id, heroMedia: about.heroFilename || "missing", gif: gifAsset ? { filename: gifAsset.originalFilename, width: gifAsset.width, height: gifAsset.height } : (mediaPath ? "will upload supplied asset" : "local path required"), actions }, null, 2));
if (!commit) process.exit(0);

let asset = gifAsset;
if (about.heroFilename !== mediaName && !asset) {
  if (!mediaPath || !existsSync(mediaPath)) throw new Error("Não foi possível localizar o GIF para upload.");
  asset = await client.assets.upload("file", readFileSync(mediaPath), { filename: mediaName, contentType: "image/gif" });
}

let transaction = client.transaction();
if (!projectsPage) {
  transaction = transaction.create({ _id: "projects-page", _type: "projectsPage", eyebrow: { _type: "localizedString", pt: "ARQUIVO", en: "ARCHIVE" }, title: { _type: "localizedString", pt: "PROJETOS", en: "PROJECTS" } });
} else {
  transaction = transaction.patch("projects-page", (patch) => patch.setIfMissing({ "eyebrow.pt": "ARQUIVO", "eyebrow.en": "ARCHIVE", "title.pt": "PROJETOS", "title.en": "PROJECTS" }));
}
projects.forEach((project, index) => {
  const fields = {};
  if (project.archiveOrder == null) fields.archiveOrder = index + 1;
  if (project.showInProjects == null) fields.showInProjects = true;
  if (Object.keys(fields).length) transaction = transaction.patch(project._id, (patch) => patch.setIfMissing(fields));
});
transaction = transaction.patch("about-page", (patch) => {
  const missingFields = {};
  if (!about.creatorHeading?.pt) missingFields["creatorHeading.pt"] = "quem cria";
  if (!about.creatorHeading?.en) missingFields["creatorHeading.en"] = "who creates";
  if (!about.circulationHeading?.pt) missingFields["circulationHeading.pt"] = "circulação";
  if (!about.circulationHeading?.en) missingFields["circulationHeading.en"] = "circulation";
  let updated = patch.setIfMissing(missingFields);
  if (splitBio) {
    updated = updated.set({
      intro: { ...(about.intro || {}), pt: bioPt[0], en: bioEn[0] },
      bio: { ...(about.bio || {}), pt: bioPt.slice(1).join("\n\n"), en: bioEn.slice(1).join("\n\n") },
    });
  }
  if (asset && about.heroFilename !== mediaName) updated = updated.setIfMissing({ heroMedia: { _type: "file", asset: { _type: "reference", _ref: asset._id } } });
  return updated;
});
await transaction.commit();

const verification = await client.fetch(`{"projectCount": count(*[_type == "project"]), "projectControls": count(*[_type == "project" && defined(archiveOrder) && defined(showInProjects)]), "visibleProjects": count(*[_type == "project" && showInProjects != false]), "projectsPage": *[_type == "projectsPage" && _id == "projects-page"][0]{eyebrow, title}, "about": *[_type == "aboutPage" && _id == "about-page"][0]{creatorHeading, circulationHeading, "heroFilename": heroMedia.asset->originalFilename, "circulationCount": count(circulation)}}`);
console.log(JSON.stringify({ committed: true, verification, gif: asset ? { id: asset._id, filename: asset.originalFilename } : null }, null, 2));
