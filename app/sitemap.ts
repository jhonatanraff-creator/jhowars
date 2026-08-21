import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/project-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects=await getProjects();
  const baseUrl = "https://jhowars.com";
  const pages = ["", "/work", "/about", "/contact"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const works = projects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));
  return [...pages, ...works];
}
