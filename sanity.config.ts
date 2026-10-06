import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

const singleton = (S: StructureBuilder, type: string, id: string, title: string) =>
  S.listItem().title(title).child(S.document().schemaType(type).documentId(id));

const deskStructure = (S: StructureBuilder) =>
  S.list().title("Jhow.ars").items([
    S.listItem().title("HOME").child(S.documentTypeList("homePost").title("Publicações da Home").defaultOrdering([{ field: "internalName", direction: "asc" }])),
    S.listItem().title("OBRAS").child(S.documentTypeList("artwork").title("Todas as obras")),
    S.listItem().title("PROJETOS").child(S.documentTypeList("project").title("Todos os projetos")),
    S.listItem().title("SHOP").child(S.list().title("Produtos").items([
      S.listItem().title("Todos os produtos").child(S.documentTypeList("shopItem").title("Todos os produtos")),
      S.listItem().title("Disponíveis").child(S.documentTypeList("shopItem").title("Disponíveis").filter('_type == "shopItem" && availability == "available"')),
      S.listItem().title("Esgotados").child(S.documentTypeList("shopItem").title("Esgotados").filter('_type == "shopItem" && availability == "sold-out"')),
      S.listItem().title("Em breve").child(S.documentTypeList("shopItem").title("Em breve").filter('_type == "shopItem" && availability == "coming-soon"')),
    ])),
    singleton(S, "aboutPage", "about-page", "SOBRE · Página Sobre"),
    singleton(S, "siteSettings", "site-settings", "SITE · Configurações"),
  ]);

export default defineConfig({
  name: "jhowars",
  title: "Jhow.ars",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "frut5d17",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [structureTool({ structure: deskStructure })],
  schema: { types: schemaTypes },
});
