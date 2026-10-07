import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkWall } from "@/components/artwork-wall";
import { ProjectContentBlocks } from "@/components/project-content-blocks";
import { copy, localizedHref, type Locale } from "@/lib/i18n";
import { getAboutPage, getHomePosts, getProjectBySlug, getProjects, getShopItems, getSiteSettings } from "@/lib/portfolio";

const projectPaths = { pt: "/projetos", en: "/en/projects" } as const;
const detailPath = (locale: Locale, slug: string) => `${projectPaths[locale]}/${slug}`;
const canonical = (path: string, pathEn: string, locale: Locale) => ({ canonical: `https://jhowars.com${locale === "en" ? pathEn : path}`, languages: { "pt-BR": `https://jhowars.com${path}`, en: `https://jhowars.com${pathEn}` } });

export async function HomeContent({ locale }: { locale: Locale }) {
  return <div className="home-page"><ArtworkWall homePosts={await getHomePosts(locale)} locale={locale} /></div>;
}

export async function ProjectsContent({ locale }: { locale: Locale }) {
  const projects = await getProjects(locale);
  const labels = copy[locale];
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">{labels.archive}</p><h1>{labels.projects}</h1></header>
    <section className="projects-grid" aria-label={labels.projects}>
      {projects.map((project, index) => <Link key={project._id} href={detailPath(locale, project.slug)} className={`project-tile tile-${index % 4}`}>
        <div className="tile-image"><Image src={project.cover} alt={project.title} fill sizes="(max-width: 700px) 90vw, 45vw" /></div>
        <div className="tile-caption"><h2>{project.title}</h2>{project.year && <span>{project.year}</span>}</div>
      </Link>)}
    </section>
  </div>;
}

export async function ProjectDetailContent({ params, locale }: { params: Promise<{ slug: string }>; locale: Locale }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();
  const labels = copy[locale];
  const blocks = project.contentBlocks ?? [];
  const gallery = project.artworks?.filter((artwork) => artwork.image && artwork.image !== project.cover) ?? [];
  const description = project.summary || project.descriptionPt || project.descriptionEn;
  return <article className="detail-page page-shell">
    <Link className="back-link" href={localizedHref("/projetos", locale)}>← {labels.projects}</Link>
    <header className="detail-heading"><p className="eyebrow">{project.category ?? labels.projects}{project.year ? ` · ${project.year}` : ""}</p><h1>{project.title}</h1></header>
    {project.cover && <figure className="detail-cover"><Image src={project.cover} alt={project.title} fill sizes="96vw" priority /></figure>}
    {blocks.length > 0 ? <ProjectContentBlocks blocks={blocks} /> : <>
      {gallery.length > 0 && <section className="detail-gallery" aria-label={locale === "en" ? `More images from ${project.title}` : `Mais imagens de ${project.title}`}>
        {gallery.map((artwork) => <figure key={artwork._id}><Image src={artwork.image} alt={artwork.alt || artwork.title} fill sizes="(max-width: 700px) 90vw, 44vw" /><figcaption>{artwork.title}</figcaption></figure>)}
      </section>}
      {description && <section className="detail-copy"><div>{description.split("\n\n").map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div></section>}
    </>}
  </article>;
}

export async function AboutContent({ locale }: { locale: Locale }) {
  const about = await getAboutPage(locale);
  const labels = copy[locale];
  const paragraphs = about?.bio?.split("\n\n").filter(Boolean) ?? [];
  return <article className="about-page page-shell">
    <p className="eyebrow">Jhow.ars · {locale === "en" ? "Visual artist & illustrator · Brazil" : "Artista visual e ilustrador · Brasil"}</p><h1>{labels.about}</h1>
    {about?.portrait && <figure className="about-portrait"><Image src={about.portrait} alt={locale === "en" ? "Portrait of Jhow.ars" : "Retrato de Jhow.ars"} fill sizes="(max-width: 700px) 90vw, 40vw" /></figure>}
    <div className="about-copy">{about?.intro && <p className="about-intro">{about.intro}</p>}{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div>
    {about?.circulation?.length ? <section className="about-section"><p className="eyebrow">{labels.circulation}</p><ul className="circulation-list">{about.circulation.map((item, index) => <li key={`${item.name}-${index}`}><h2>{item.name}</h2><p>{[item.organization, [item.city, item.state].filter(Boolean).join(" · "), item.years?.join(", ")].filter(Boolean).join(" · ")}</p>{item.description && <p>{item.description}</p>}{item.link && <a href={item.link}>{item.link} ↗</a>}</li>)}</ul></section> : null}
    {about?.clients?.length ? <section className="about-section"><p className="eyebrow">{labels.clients}</p><p>{about.clients.join(" · ")}</p></section> : null}
    {about?.press?.length ? <section className="about-section"><p className="eyebrow">{labels.press}</p><ul>{about.press.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section> : null}
    {about?.additionalSections?.map((section, index) => <section className="about-section" key={`${section.heading || "section"}-${index}`}><p className="eyebrow">{section.heading}</p><div className="additional-copy">{section.body?.split("\n").filter(Boolean).map((line, lineIndex) => <p key={`${lineIndex}-${line.slice(0, 20)}`}>{line}</p>)}</div></section>)}
  </article>;
}

export async function ShopContent({ locale }: { locale: Locale }) {
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
  const settings = await getSiteSettings(locale);
  const ptPaths = { projects: "/projetos", about: "/sobre", shop: "/shop" };
  const enPaths = { projects: "/en/projects", about: "/en/about", shop: "/en/shop" };
  const title = page === "projects" ? labels.projects : page === "about" ? labels.about : labels.shop;
  return { title, description: settings?.seoDescription, alternates: canonical(ptPaths[page], enPaths[page], locale) };
}

export async function projectMetadata(params: Promise<{ slug: string }>, locale: Locale): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  return project ? { title: project.title, description: project.summary || project.descriptionPt || project.descriptionEn, alternates: canonical(`/projetos/${slug}`, `/en/projects/${slug}`, locale) } : {};
}

export async function staticProjectParams() { return (await getProjects()).map((project) => ({ slug: project.slug })); }
