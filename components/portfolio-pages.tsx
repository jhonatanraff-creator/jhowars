import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkWall } from "@/components/artwork-wall";
import { ProjectContentBlocks } from "@/components/project-content-blocks";
import { ProjectImageLightbox } from "@/components/project-image-lightbox";
import { ProjectListing } from "@/components/project-listing";
import { copy, localizedHref, type Locale } from "@/lib/i18n";
import { getAboutPage, getHomePosts, getProjectBySlug, getProjects, getProjectsPage, getShopItems, getSiteSettings } from "@/lib/portfolio";

const projectPaths = { pt: "/projetos", en: "/en/projects" } as const;
const detailPath = (locale: Locale, slug: string) => `${projectPaths[locale]}/${slug}`;
const canonical = (path: string, pathEn: string, locale: Locale) => ({ canonical: `https://jhowars.com${locale === "en" ? pathEn : path}`, languages: { "pt-BR": `https://jhowars.com${path}`, en: `https://jhowars.com${pathEn}` } });

export async function HomeContent({ locale }: { locale: Locale }) {
  return <div className="home-page"><ArtworkWall homePosts={await getHomePosts(locale)} locale={locale} /></div>;
}

export async function ProjectsContent({ locale }: { locale: Locale }) {
  const [allProjects, page] = await Promise.all([getProjects(locale), getProjectsPage(locale)]);
  const projects = allProjects.filter((project) => project.showInProjects !== false);
  const labels = copy[locale];
  return <div className="projects-index">
    <header className="projects-page-heading">
      <p className="eyebrow">{page.eyebrow || (locale === "en" ? "ARCHIVE" : "ARQUIVO")}</p>
      <h1>{page.title || (locale === "en" ? "PROJECTS" : "PROJETOS")}</h1>
      {page.optionalIntro && <p className="projects-page-intro">{page.optionalIntro}</p>}
    </header>
    <ProjectListing projects={projects} locale={locale} labels={{ all: labels.all, noProjectsInCategory: labels.noProjectsInCategory }} />
  </div>;
}

export async function ProjectDetailContent({ params, locale }: { params: Promise<{ slug: string }>; locale: Locale }) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([getProjectBySlug(slug, locale), getProjects(locale)]);
  if (!project) notFound();
  const labels = copy[locale];
  const blocks = project.contentBlocks ?? [];
  const gallery = project.artworks?.filter((artwork) => artwork.image && artwork.image !== project.cover) ?? [];
  const description = project.summary || project.descriptionPt || project.descriptionEn;
  const manualRelated = (project.relatedProjects || []).filter((item) => item._id !== project._id).slice(0, 3);
  const fallbackRelated = allProjects.filter((item) => item._id !== project._id && item.showInProjects !== false).slice(0, 3);
  const relatedProjects = manualRelated.length ? manualRelated : fallbackRelated;
  const editorialSequence = project.contentLayout === "editorial-sequence";
  return <article className={`detail-page page-shell${editorialSequence ? " project-detail--editorial-sequence" : ""}`}>
    {!editorialSequence && <>
      <Link className="back-link" href={localizedHref("/projetos", locale)}>← {labels.projects}</Link>
      <header className="detail-heading"><p className="eyebrow">{project.category ?? labels.projects}{project.year ? ` · ${project.year}` : ""}</p><h1>{project.title}</h1></header>
    </>}
    <ProjectImageLightbox closeLabel={labels.close} zoomInLabel={locale === "en" ? "Zoom in" : "Aumentar zoom"} zoomOutLabel={locale === "en" ? "Zoom out" : "Diminuir zoom"} resetLabel={locale === "en" ? "Reset zoom" : "Restaurar zoom"} imageLabel={locale === "en" ? "Project image" : "Imagem do projeto"} previousLabel={labels.previous} nextLabel={labels.next}>
      {!editorialSequence && project.cover && <figure className="detail-cover"><button className="detail-cover-trigger project-lightbox-trigger" type="button" aria-label={locale === "en" ? `Open image: ${project.title}` : `Abrir imagem: ${project.title}`} data-project-lightbox-image data-lightbox-src={project.cover} data-lightbox-alt={project.title} data-lightbox-caption=""><Image src={project.cover} alt={project.title} fill sizes="(max-width: 800px) 96vw, 92vw" quality={90} priority /></button></figure>}
      {blocks.length > 0 ? <ProjectContentBlocks blocks={blocks} /> : <>
        {gallery.length > 0 && <section className="detail-gallery" aria-label={locale === "en" ? `More images from ${project.title}` : `Mais imagens de ${project.title}`}>
          {gallery.map((artwork) => <figure key={artwork._id}><button className="detail-gallery-trigger project-lightbox-trigger" type="button" aria-label={locale === "en" ? `Open image: ${artwork.title}` : `Abrir imagem: ${artwork.title}`} data-project-lightbox-image data-lightbox-src={artwork.image || ""} data-lightbox-alt={artwork.alt || artwork.title} data-lightbox-caption={artwork.title}><Image src={artwork.image || ""} alt={artwork.alt || artwork.title} fill sizes="(max-width: 800px) calc(100vw - 48px), (max-width: 1560px) 44vw, 750px" quality={90} /></button><figcaption>{artwork.title}</figcaption></figure>)}
        </section>}
        {description && <section className="detail-copy"><div>{description.split("\n\n").map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div></section>}
      </>}
    </ProjectImageLightbox>
    {relatedProjects.length > 0 && <section className="related-projects" aria-labelledby="related-projects-title">
      <div className="related-projects-heading"><h2 id="related-projects-title">{locale === "en" ? "YOU MAY ALSO LIKE" : "OUTROS PROJETOS"}</h2><Link href={projectPaths[locale]}>{labels.allProjects} →</Link></div>
      <div className="related-projects-grid">
        {relatedProjects.map((item) => <Link className="related-project" key={item._id} href={detailPath(locale, item.slug)}>
          {item.cover && <figure className="related-project-image" style={item.coverAspectRatio ? { aspectRatio: String(item.coverAspectRatio) } : undefined}><Image src={item.cover} alt="" fill sizes="(max-width: 620px) calc(100vw - 48px), (max-width: 1024px) 46vw, (max-width: 1566px) 30vw, 470px" quality={90} /></figure>}
          <h3>{item.title}</h3>
          {(item.category || item.year) && <p>{[item.category, item.year].filter(Boolean).join(" · ")}</p>}
        </Link>)}
      </div>
    </section>}
  </article>;
}

export async function AboutContent({ locale }: { locale: Locale }) {
  const about = await getAboutPage(locale);
  const bioParagraphs = about?.bio?.split("\n\n").filter(Boolean) ?? [];
  const intro = about?.intro || bioParagraphs[0];
  const additionalBio = about?.intro ? bioParagraphs : bioParagraphs.slice(1);
  const media = about?.heroMedia?.url;
  const mediaAlt = about?.heroMediaAlt || (locale === "en" ? "Jhow.ars artwork" : "Trabalho de Jhow.ars");
  return <article className="about-page page-shell">
    <section className="about-introduction">
      <h1>{about?.creatorHeading || (locale === "en" ? "who creates" : "quem cria")}</h1>
      <div className="about-lead-grid">
        {intro && <p className="about-lead-copy">{intro}</p>}
        {(media || about?.portrait) && <figure className="about-hero-media">
          {media ? <Image src={media} alt={mediaAlt} width={about?.heroMedia?.width || 1200} height={about?.heroMedia?.height || 1200} unoptimized priority sizes="(max-width: 767px) 92vw, 48vw" /> : <Image src={about!.portrait!} alt={mediaAlt} fill priority sizes="(max-width: 767px) 92vw, 48vw" />}
        </figure>}
      </div>
      {additionalBio.length > 0 && <div className="about-supporting-copy">{additionalBio.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div>}
    </section>
    {about?.circulation?.length ? <section className="about-section circulation-section"><h2>{about.circulationHeading || (locale === "en" ? "circulation" : "circulação")}</h2><ul className="circulation-list">{about.circulation.map((item, index) => <li key={`${item.name}-${index}`}><h3>{item.name}</h3>{item.organization && <p className="circulation-organization">{item.organization}</p>}{item.description && <p className="circulation-description">{item.description}</p>}<p className="circulation-meta">{[[item.city, item.state].filter(Boolean).join(" · "), item.years?.join(", ")].filter(Boolean).join(" · ")}</p>{item.link && <a href={item.link}>{item.link} ↗</a>}</li>)}</ul></section> : null}
  </article>;
}

export async function ShopContent({ locale }: { locale: Locale }) {
  const settings = await getSiteSettings(locale);
  if (settings?.shopEnabled !== true) notFound();
  const items = await getShopItems(locale);
  const labels = copy[locale];
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">Jhow.ars</p><h1>Shop</h1></header>
    {items.length ? <section className="shop-grid" aria-label={locale === "en" ? "Products" : "Produtos"}>
      {items.map((item) => <article className="shop-item" key={item._id}>
        <div className="shop-images">{item.productImages.filter((image) => image.image).map((image, index) => <figure key={image._key || `${item._id}-${index}`}><Image src={image.image!} alt={image.alt || item.title} width={960} height={1200} sizes="(max-width: 700px) 90vw, 45vw" /><figcaption>{image.caption}</figcaption></figure>)}</div>
        <div className="shop-info"><h2>{item.title}</h2>
          {item.technique && <p>{item.technique}</p>}{item.dimensions && <p>{item.dimensions}</p>}{item.edition && <p>{item.edition}</p>}{item.description && <p className="shop-description">{item.description}</p>}
          {item.availability === "available" ? <>{item.price !== undefined && <p className="shop-price">{new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", { style: "currency", currency: item.currency ?? "BRL" }).format(item.price)}</p>}{item.ramonaUrl && <a className="shop-cta" href={item.ramonaUrl} target="_blank" rel="noreferrer">{labels.buy} ↗</a>}</> : <p className="shop-status">{item.availability === "sold-out" ? labels.soldOut : labels.comingSoon}</p>}
        </div>
      </article>)}
    </section> : <p className="empty-shop">{labels.shopComing}</p>}
  </div>;
}

export async function pageMetadata(locale: Locale, page: "projects" | "about" | "shop"): Promise<Metadata> {
  const labels = copy[locale];
  const [settings, projectsPage] = await Promise.all([getSiteSettings(locale), page === "projects" ? getProjectsPage(locale) : Promise.resolve(null)]);
  const ptPaths = { projects: "/projetos", about: "/sobre", shop: "/shop" };
  const enPaths = { projects: "/en/projects", about: "/en/about", shop: "/en/shop" };
  const title = page === "projects" ? projectsPage?.title || labels.projects : page === "about" ? labels.about : labels.shop;
  return { title, description: settings?.seoDescription, alternates: canonical(ptPaths[page], enPaths[page], locale), ...(page === "shop" && settings?.shopEnabled !== true ? { robots: { index: false, follow: false } } : {}) };
}

export async function projectMetadata(params: Promise<{ slug: string }>, locale: Locale): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  return project ? { title: project.title, description: project.summary || project.descriptionPt || project.descriptionEn, alternates: canonical(`/projetos/${slug}`, `/en/projects/${slug}`, locale) } : {};
}

export async function staticProjectParams() { return (await getProjects()).map((project) => ({ slug: project.slug })); }
