import { createClient } from "@sanity/client";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fallbackArtworks, fallbackProjects } from "../data/portfolio.ts";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

const commit = process.argv.includes("--commit");
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) throw new Error("Configure NEXT_PUBLIC_SANITY_PROJECT_ID e NEXT_PUBLIC_SANITY_DATASET antes de executar.");
if (dataset === "production" && !allowProduction) throw new Error("O dataset production exige o argumento explícito --allow-production.");
if (commit && (!token || process.env.SANITY_SEED_CONFIRM !== "YES")) throw new Error("Para gravar, informe SANITY_API_TOKEN e SANITY_SEED_CONFIRM=YES.");

const client = createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false, perspective: "published" });
const resolveAsset = (url) => {
  const filepath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  if (!existsSync(filepath)) throw new Error(`Asset local não encontrado: ${filepath}`);
  return filepath;
};

console.log(`Modo: ${commit ? "GRAVAÇÃO protegida" : "DRY-RUN (nenhuma escrita)"}`);
console.log(`Dataset: ${dataset}`);
console.log(`Projetos: ${fallbackProjects.length}; obras: ${fallbackArtworks.length}; configuração: 1.`);
console.log("Criação idempotente: createIfNotExists; documentos já existentes não serão sobrescritos.");
if (!commit) process.exit(0);

const assets = new Map();
async function upload(url) {
  const filepath = resolveAsset(url);
  if (!assets.has(filepath)) {
    const asset = await client.assets.upload("image", createReadStream(filepath), { filename: path.basename(filepath) });
    assets.set(filepath, asset._id);
    console.log(`Asset criado: ${path.basename(filepath)}`);
  }
  return assets.get(filepath);
}

const projectIds = new Map();
for (const [order, project] of fallbackProjects.entries()) {
  const asset = await upload(project.cover);
  const id = `legacy-project-${project.slug}`;
  projectIds.set(project.slug, id);
  const doc = {
    _id: id, _type: "project", title: project.title, slug: { _type: "slug", current: project.slug },
    ...(project.year ? { year: project.year } : {}), ...(project.category ? { category: project.category } : {}),
    ...(project.descriptionPt ? { descriptionPt: project.descriptionPt } : {}), ...(project.descriptionEn ? { descriptionEn: project.descriptionEn } : {}),
    cover: { _type: "image", asset: { _type: "reference", _ref: asset } }, featured: project.featured,
    status: "published", order,
  };
  await client.createIfNotExists(doc);
  console.log(`Projeto verificado/criado: ${project.slug}`);
}

for (const [order, artwork] of fallbackArtworks.entries()) {
  const asset = await upload(artwork.image);
  const id = `legacy-artwork-${artwork.projectSlug}-${String(order + 1).padStart(2, "0")}`;
  const doc = {
    _id: id, _type: "artwork", title: artwork.title,
    image: { _type: "image", asset: { _type: "reference", _ref: asset } }, alt: artwork.alt,
    project: { _type: "reference", _ref: projectIds.get(artwork.projectSlug) }, layout: artwork.layout,
    status: "published", order,
  };
  await client.createIfNotExists(doc);
  console.log(`Obra verificada/criada: ${artwork.projectSlug}`);
}

await client.createIfNotExists({
  _id: "site-settings", _type: "siteSettings", siteName: "Jhow.ars",
  descriptionEn: "Visual artist and designer focused on illustration, print editions, art books, zines and experimental visual projects. Authorial portfolio by Jhow.ars.",
  email: "jhow@jhowars.com", instagram: "https://www.instagram.com/jhow.ars/",
  behance: "https://www.behance.net/Jhonatanraff", linkedin: "https://www.linkedin.com/in/jhonatanrafaelars",
});
console.log("Configuração verificada/criada. Migração concluída sem sobrescrever documentos existentes.");
