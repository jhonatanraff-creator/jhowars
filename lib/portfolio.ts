import { createClient } from "next-sanity";
import { fallbackArtworks, fallbackProjects, type PortfolioArtwork, type PortfolioProject } from "@/data/portfolio";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const client = projectId && dataset ? createClient({ projectId, dataset, apiVersion: "2025-01-01", useCdn: true }) : null;

export async function getProjects(): Promise<PortfolioProject[]> {
  if (!client) return fallbackProjects;
  try {
    const live = await client.fetch<PortfolioProject[]>(`*[_type == "project" && status == "published"] | order(order asc, title asc){_id,_type,title,"slug":slug.current,year,category,descriptionPt,descriptionEn,"cover":cover.asset->url,featured}`);
    return live.length ? live : fallbackProjects;
  } catch { return fallbackProjects; }
}

export async function getArtworks(): Promise<PortfolioArtwork[]> {
  if (!client) return fallbackArtworks;
  try {
    const live = await client.fetch<PortfolioArtwork[]>(`*[_type == "artwork" && status == "published"] | order(order asc, title asc){_id,_type,title,"image":image.asset->url,alt,"projectSlug":project->slug.current,layout}`);
    return live.length ? live : fallbackArtworks;
  } catch { return fallbackArtworks; }
}

export async function getShopItems(): Promise<Array<{_id:string; title:string; descriptionPt?:string; image?:string; price?:number; currency?:string; externalUrl?:string}>> {
  if (!client) return [];
  try { return await client.fetch(`*[_type == "shopItem" && status == "available"] | order(order asc){_id,title,descriptionPt,"image":image.asset->url,price,currency,externalUrl}`); }
  catch { return []; }
}
