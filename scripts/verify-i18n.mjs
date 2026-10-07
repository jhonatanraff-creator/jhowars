import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}
const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset, SANITY_API_TOKEN: token } = process.env;
if (!projectId || !dataset || !token) throw new Error("Sanity não configurado; nenhum valor sensível foi exibido.");
const client = createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", token, useCdn: false, perspective: "published" });
const docs = await client.fetch('*[_type in ["project", "artwork", "homePost", "aboutPage", "siteSettings", "shopItem"]]{...}');
const typeCounts = docs.reduce((counts, doc) => ({ ...counts, [doc._type]: (counts[doc._type] || 0) + 1 }), {});
const errors = [];
function requirePair(doc, field, value) {
  if (!value || typeof value !== "object" || typeof value.pt !== "string" || !value.pt || typeof value.en !== "string" || !value.en) errors.push(`${doc._id}.${field} sem ambos idiomas`);
}
for (const doc of docs) {
  if (doc._type === "project") { requirePair(doc, "title", doc.title); if (doc.summary) requirePair(doc, "summary", doc.summary); }
  if (doc._type === "artwork") { requirePair(doc, "title", doc.title); for (const field of ["description", "technique", "edition", "altText"]) if (doc[field]) requirePair(doc, field, doc[field]); }
  if (doc._type === "homePost") {
    if (typeof doc.hoverBackgroundColor !== "string" || typeof doc.hoverTextColor !== "string") errors.push(`${doc._id} sem cores de hover`);
    if (doc.modalTitle) requirePair(doc, "modalTitle", doc.modalTitle);
    for (const field of ["description", "technique", "edition", "altText"]) if (doc[field]) requirePair(doc, field, doc[field]);
  }
  if (doc._type === "aboutPage") requirePair(doc, "bio", doc.bio);
  if (doc._type === "siteSettings") for (const field of ["artistSubtitle", "locationLabel", "footerAvailability", "seoTitle", "seoDescription"]) requirePair(doc, field, doc[field]);
}
const refs = new Set();
function collect(value) {
  if (Array.isArray(value)) { value.forEach(collect); return; }
  if (!value || typeof value !== "object") return;
  if (value._type === "reference" && value._ref) refs.add(value._ref);
  Object.values(value).forEach(collect);
}
docs.forEach(collect);
const refIds = [...refs];
for (let start = 0; start < refIds.length; start += 80) {
  const batch = refIds.slice(start, start + 80);
  const found = new Set(await client.fetch("*[_id in $ids]._id", { ids: batch }));
  for (const id of batch) if (!found.has(id)) errors.push(`referência sem destino ${id.startsWith("image-") || id.startsWith("file-") ? "de asset" : "de documento"}`);
}
for (const [type, count] of Object.entries(typeCounts)) console.log(`${type}: ${count}`);
console.log(`Referências verificadas: ${refs.size}; idiomas de campos validados: PT/EN.`);
if (errors.length) { console.log(`Pendências: ${errors.length}`); for (const error of errors) console.log(error); process.exitCode = 1; }
else console.log("Validação CMS/i18n: aprovada; pares localizados e referências resolvidos.");
