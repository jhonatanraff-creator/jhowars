import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "jhowars",
  title: "Jhow.ars",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  schema: { types: schemaTypes },
});
