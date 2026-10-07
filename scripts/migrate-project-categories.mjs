import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
}

const commit = process.argv.includes("--commit");
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !dataset || !token) {
  console.error("Set the Sanity project, dataset, and token in .env.local before running this migration.");
  process.exit(1);
}
if (commit && (!allowProduction || dataset === "production" && process.env.PROJECT_CATEGORIES_CONFIRM !== "YES")) {
  console.error("Writes require --allow-production and PROJECT_CATEGORIES_CONFIRM=YES for the production dataset.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", useCdn: false });
const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const keyOf = (title) => JSON.stringify([title?.pt?.trim() || "", title?.en?.trim() || ""].map((part) => part.normalize("NFC").toLocaleLowerCase()));

try {
  const [projects, existingCategories] = await Promise.all([
    client.fetch(`*[_type == "project"]{_id,title,category,categories[]{_key,_ref}}`),
    client.fetch(`*[_type == "projectCategory"]{_id,title,"slug":slug.current,sortOrder,enabled}`),
  ]);
  const groups = new Map();
  for (const project of projects) {
    const title = project.category;
    if (!title?.pt && !title?.en) continue;
    const normalized = { pt: title.pt?.trim() || title.en?.trim() || "", en: title.en?.trim() || title.pt?.trim() || "" };
    const key = keyOf(normalized);
    if (!groups.has(key)) groups.set(key, { title: normalized, projects: [] });
    groups.get(key).projects.push(project);
  }
  const categories = [...groups.values()].sort((a, b) => a.title.pt.localeCompare(b.title.pt, "pt-BR"));
  const categoryPlans = [];
  const projectPlans = [];
  const conflicts = [];
  categories.forEach((group, index) => {
    const slug = slugify(group.title.pt || group.title.en);
    const id = `projectCategory-${slug}`;
    const byId = existingCategories.find((item) => item._id.replace(/^drafts\./, "") === id);
    const bySlug = existingCategories.find((item) => item.slug === slug);
    const existing = byId || bySlug;
    if (existing && ((existing.title?.pt && existing.title.pt !== group.title.pt) || (existing.title?.en && existing.title.en !== group.title.en))) {
      conflicts.push({ slug, documentId: existing._id, currentTitle: existing.title, legacyTitle: group.title });
    }
    categoryPlans.push({ id, slug, title: group.title, sortOrder: (index + 1) * 10, projects: group.projects.map((item) => item._id), action: existing ? "reuse" : "create", existingId: existing?._id });
    for (const project of group.projects) {
      const referenceId = existing?._id.replace(/^drafts\./, "") || id;
      const currentRefs = project.categories || [];
      if (!currentRefs.some((reference) => reference._ref?.replace(/^drafts\./, "") === referenceId)) {
        projectPlans.push({ projectId: project._id, title: project.title?.pt || project.title?.en, categoryId: referenceId, currentCount: currentRefs.length });
      }
    }
  });
  const missingProjectCategories = projects.filter((project) => !project.category?.pt && !project.category?.en).map((project) => ({ id: project._id, title: project.title?.pt || project.title?.en }));
  console.log(JSON.stringify({ mode: commit ? "commit" : "dry-run", dataset, projectCount: projects.length, categories: categoryPlans, projectReferenceUpdates: projectPlans, projectsWithoutLegacyCategory: missingProjectCategories, conflicts }, null, 2));
  if (conflicts.length) {
    console.error("Category title conflicts found; no writes were performed.");
    process.exit(2);
  }
  if (!commit) {
    console.log("Dry run complete. No Sanity documents were written.");
    process.exit(0);
  }
  const transaction = client.transaction();
  for (const category of categoryPlans) {
    if (category.action === "create") transaction.createIfNotExists({ _id: category.id, _type: "projectCategory", title: category.title, slug: { _type: "slug", current: category.slug }, sortOrder: category.sortOrder, enabled: true });
  }
  for (const update of projectPlans) {
    const project = projects.find((item) => item._id === update.projectId);
    const group = categories.find((item) => item.projects.some((p) => p._id === update.projectId));
    const category = categoryPlans.find((item) => item.title.pt === group.title.pt && item.title.en === group.title.en);
    const referenceId = category.existingId?.replace(/^drafts\./, "") || category.id;
    const refs = [...(project.categories || [])];
    if (!refs.some((reference) => reference._ref?.replace(/^drafts\./, "") === referenceId)) refs.push({ _key: `cat-${category.slug}`, _type: "reference", _ref: referenceId });
    transaction.patch(project._id, (patch) => patch.set({ categories: refs }));
  }
  const result = await transaction.commit();
  console.log(JSON.stringify({ written: true, transactionId: result.transactionId, categoryDocumentsCreated: categoryPlans.filter((item) => item.action === "create").length, projectsUpdated: projectPlans.length }, null, 2));
} catch {
  console.error("Category migration failed; response details suppressed.");
  process.exitCode = 1;
}
