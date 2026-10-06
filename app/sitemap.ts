import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const baseUrl = "https://jhowars.com";
  return [
    ...["", "/projetos", "/sobre", "/shop"].map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 })),
    ...projects.map((project) => ({ url: `${baseUrl}/projetos/${project.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
