import { createClient } from "next-sanity";
import { fallbackArtworks, fallbackProjects, type PortfolioArtwork, type PortfolioProject } from "@/data/portfolio";
import { fallbackAboutPage, fallbackSiteSettings } from "@/data/legacy-cms";
import { localizeTree, type Locale } from "@/lib/i18n";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const client = projectId && dataset ? createClient({ projectId, dataset, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01", useCdn: true }) : null;

export type HomePost = {
  _id: string; internalName: string; enabled: boolean; image?: string; imageAspectRatio?: number; mobileImage?: string; orientation: string; sizeHint: string;
  artwork?: { _id: string; title?: string; projectSlug?: string; images?: Array<{ _key: string; image?: string; alt?: string; caption?: string }>; year?: number; technique?: string; dimensions?: string; edition?: string; description?: string };
  project?: { _id: string; title?: string; slug?: string; category?: string; year?: number; summary?: string };
  modalTitle?: string; year?: number; technique?: string; dimensions?: string; edition?: string; description?: string;
  hoverBackgroundColor?: string; hoverBackgroundCustom?: string; hoverTextColor?: string; hoverTextCustom?: string;
  modalGallery: Array<{ _key: string; image?: string; alt?: string; caption?: string }>; altText?: string; weight?: number;
};
export type CmsArtwork = PortfolioArtwork & { year?: number; technique?: string; dimensions?: string; edition?: string; description?: string; status?: string; images?: Array<{ _key: string; image?: string; alt?: string; caption?: string }> };
export type CmsProjectBlock = {
  _key?: string; _type: string; heading?: string; body?: string; widthStyle?: "small" | "medium" | "large" | "full";
  imageUrl?: string; alt?: string; caption?: string; leftImageUrl?: string; rightImageUrl?: string;
  leftAlt?: string; rightAlt?: string; leftCaption?: string; rightCaption?: string;
  mediaUrl?: string; externalUrl?: string; size?: string;
  images?: Array<{ _key: string; image?: string; alt?: string; caption?: string }>;
};
export type CmsProject = PortfolioProject & { summary?: string; client?: string; credits?: string; legacyUrl?: string; artworks?: CmsArtwork[]; contentBlocks?: CmsProjectBlock[] };
export type CmsShopItem = { _id: string; title: string; slug?: string; artwork?: CmsArtwork; productImages: Array<{ _key: string; image?: string; alt?: string; caption?: string }>; image?: string; description?: string; descriptionPt?: string; technique?: string; dimensions?: string; edition?: string; price?: number; currency?: string; availability: "available" | "sold-out" | "coming-soon"; ramonaUrl?: string; externalUrl?: string; featured?: boolean; order?: number };
export type AboutPage = { intro?: string; bio?: string; portrait?: string; circulation?: Array<{ name: string; organization?: string; city?: string; state?: string; years?: number[]; description?: string; link?: string }>; clients?: string[]; press?: string[]; additionalSections?: Array<{ heading?: string; body?: string }> };
export type SiteSettings = { artistName?: string; artistSubtitle?: string; locationLabel?: string; footerAvailability?: string; email?: string; instagram?: string; behance?: string; linkedin?: string; seoTitle?: string; seoDescription?: string; defaultOgImage?: string };

const fallbackEnglishTitles: Record<string, string> = {
  "veja-saude-editorial-illustration": "VEJA SAÚDE — Editorial Illustration", "corpos-graficos": "Corpos Gráficos",
  "bestas-do-dia-brazilian-wildlife": "BESTAS DO DIA - Brazilian Wildlife", "bumba-meu-boi": "BUMBA MEU BOI",
  "fogo-fossil": "FOGO FÓSSIL - Selection of illustrations", "posters-2024-experimental-print-and-illustration": "Posters 2024 - Experimental Print and Illustration",
  "o-que-fica-project-editorial": "O Que Fica - Project Editorial", "countenance-illustration": "Countenance - Selection of illustrations",
};
const fallbackPortugueseTitles: Record<string, string> = {
  "veja-saude-editorial-illustration": "VEJA SAÚDE", "corpos-graficos": "Corpos Gráficos", "bestas-do-dia-brazilian-wildlife": "BESTAS DO DIA",
  "bumba-meu-boi": "BUMBA MEU BOI", "fogo-fossil": "FOGO FÓSSIL", "posters-2024-experimental-print-and-illustration": "Posters 2024",
  "o-que-fica-project-editorial": "O Que Fica", "countenance-illustration": "Countenance",
};
function fallbackProjectList(locale: Locale): CmsProject[] {
  return fallbackProjects.map((item) => ({ ...item,
    title: (locale === "en" ? fallbackEnglishTitles : fallbackPortugueseTitles)[item.slug] || item.title,
    summary: locale === "en" ? item.descriptionEn : item.descriptionPt,
  } as CmsProject));
}

// Fallbacks stay centralized here; Sanity remains the final source of truth.
export async function getProjects(locale: Locale = "pt"): Promise<CmsProject[]> {
  if (!client) return fallbackProjectList(locale);
  try {
    const live = await client.fetch<CmsProject[]>(`*[_type == "project"] | order(year desc, title.pt asc){_id,_type,title,"slug":slug.current,year,category,summary,client,credits,legacyUrl,featured,"cover":coverImage.asset->url,"artworks":artworks[]->{_id,title,"image":coverImage.asset->url,altText,"projectSlug":project->slug.current},contentBlocks[]{...,"imageUrl":image.asset->url,"leftImageUrl":leftImage.asset->url,"rightImageUrl":rightImage.asset->url,"mediaUrl":media.asset->url,images[]{_key,alt,caption,"image":image.asset->url}}}`);
    return localizeTree(live, locale);
  } catch { return fallbackProjectList(locale); }
}

export async function getProjectBySlug(slug: string, locale: Locale = "pt"): Promise<CmsProject | null> {
  if (client) {
    try {
      const live = await client.fetch<CmsProject | null>(`*[_type == "project" && slug.current == $slug][0]{_id,_type,title,"slug":slug.current,year,category,summary,client,credits,legacyUrl,featured,"cover":coverImage.asset->url,"artworks":artworks[]->{_id,title,"image":coverImage.asset->url,altText,"projectSlug":project->slug.current},contentBlocks[]{...,"imageUrl":image.asset->url,"leftImageUrl":leftImage.asset->url,"rightImageUrl":rightImage.asset->url,"mediaUrl":media.asset->url,images[]{_key,alt,caption,"image":image.asset->url}}}`, { slug });
      return live ? localizeTree(live, locale) : null;
    }
    catch { /* Use the local record below while Sanity is unavailable. */ }
  }
  return fallbackProjects.some((project) => project.slug === slug) ? fallbackProjectList(locale).find((project) => project.slug === slug) || null : null;
}

export async function getArtworks(locale: Locale = "pt"): Promise<CmsArtwork[]> {
  if (!client) return fallbackArtworks;
  try {
      const live = await client.fetch<CmsArtwork[]>(`*[_type == "artwork"] | order(title.pt asc, year desc){_id,_type,title,year,technique,dimensions,edition,description,status,"image":coalesce(coverImage.asset->url,images[0].image.asset->url),altText,"alt":altText,"projectSlug":project->slug.current,"layout":"portrait",images[]{_key,alt,caption,"image":image.asset->url}}`);
    return localizeTree(live, locale);
  } catch { return fallbackArtworks; }
}

export async function getHomePosts(locale: Locale = "pt"): Promise<HomePost[]> {
  if (client) {
    try {
      const live = await client.fetch<HomePost[]>(`*[_type == "homePost" && enabled == true] | order(_createdAt asc){_id,internalName,enabled,"image":image.asset->url,"imageAspectRatio":image.asset->metadata.dimensions.aspectRatio,"mobileImage":mobileImage.asset->url,orientation,sizeHint,"artwork":artwork->{_id,title,"projectSlug":project->slug.current,year,technique,dimensions,edition,description,images[]{_key,alt,caption,"image":image.asset->url}},"project":project->{_id,title,"slug":slug.current,category,year,summary},modalTitle,year,technique,dimensions,edition,description,"modalGallery":modalGallery[]{_key,"image":image.asset->url,alt,caption},altText,weight,hoverBackgroundColor,hoverBackgroundCustom,hoverTextColor,hoverTextCustom}`);
      return localizeTree(live, locale).filter((post) => post.enabled && post.image);
    } catch { /* Return no HomePosts if the CMS query fails; never substitute unrelated artwork. */ }
  }
  return [];
}

export async function getShopItems(locale: Locale = "pt"): Promise<CmsShopItem[]> {
  if (!client) return [];
  try { return localizeTree(await client.fetch<CmsShopItem[]>(`*[_type == "shopItem"] | order(order asc, title.pt asc){_id,title,"slug":slug.current,"artwork":artwork->{_id,title,"image":coverImage.asset->url,altText,"projectSlug":project->slug.current},"productImages":productImages[]{_key,"image":image.asset->url,alt,caption},"image":productImages[0].image.asset->url,description,"currency":"BRL",technique,dimensions,edition,price,availability,ramonaUrl,"externalUrl":ramonaUrl,featured,order}`), locale); }
  catch { return []; }
}

export async function getAboutPage(locale: Locale = "pt"): Promise<AboutPage | null> {
  if (!client) return localizeTree<AboutPage>(fallbackAboutPage as unknown as AboutPage, locale);
  try { const live = await client.fetch<AboutPage | null>(`*[_type == "aboutPage" && _id == "about-page"][0]{intro,bio,"portrait":portrait.asset->url,circulation,clients,press,additionalSections}`); return live ? localizeTree(live, locale) : null; }
  catch { return localizeTree<AboutPage>(fallbackAboutPage as unknown as AboutPage, locale); }
}

export async function getSiteSettings(locale: Locale = "pt"): Promise<SiteSettings | null> {
  if (!client) return localizeTree<SiteSettings>(fallbackSiteSettings as unknown as SiteSettings, locale);
  try { const live = await client.fetch<SiteSettings | null>(`*[_type == "siteSettings" && _id == "site-settings"][0]{artistName,artistSubtitle,locationLabel,footerAvailability,email,instagram,behance,linkedin,seoTitle,seoDescription,"defaultOgImage":defaultOgImage.asset->url}`); return live ? localizeTree(live, locale) : null; }
  catch { return localizeTree<SiteSettings>(fallbackSiteSettings as unknown as SiteSettings, locale); }
}
