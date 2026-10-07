import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const baseUrl = "https://jhowars.com";
  const staticRoutes = ["", "/projetos", "/sobre", "/shop"];
  return [
    ...staticRoutes.flatMap((path) => [
      { url: `${baseUrl}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 },
      { url: `${baseUrl}/en${path === "/projetos" ? "/projects" : path === "/sobre" ? "/about" : path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 },
    ]),
    ...projects.map((project) => ({ url: `${baseUrl}/projetos/${project.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...projects.map((project) => ({ url: `${baseUrl}/en/projects/${project.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
