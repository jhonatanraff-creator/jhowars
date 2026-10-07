"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CmsProject, CmsProjectCategory } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";

export function ProjectListing({ projects, locale, labels }: { projects: CmsProject[]; locale: Locale; labels: { all: string; noProjectsInCategory: string } }) {
  const [selected, setSelected] = useState("");
  const readUrl = useCallback(() => setSelected(new URL(window.location.href).searchParams.get("category") || ""), []);
  useEffect(() => {
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, [readUrl]);

  const categories = new Map<string, CmsProjectCategory>();
  for (const project of projects) {
    if (project.showInProjects === false) continue;
    for (const category of project.categories || []) {
      if (category.enabled !== false && category.slug) categories.set(category.slug, category);
    }
  }
  const sortedCategories = [...categories.values()].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.title.localeCompare(b.title));
  const visibleProjects = projects.filter((project) => project.showInProjects !== false && (!selected || project.categories?.some((category) => category.slug === selected && category.enabled !== false)));
  const projectBase = locale === "en" ? "/en/projects" : "/projetos";
  const changeFilter = (slug: string) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setSelected(slug);
  };

  return <>
    <nav className="project-category-filters" aria-label={locale === "en" ? "Filter projects by category" : "Filtrar projetos por categoria"}>
      <button type="button" aria-pressed={!selected} className={!selected ? "is-active" : ""} onClick={() => changeFilter("")}>{labels.all}</button>
      {sortedCategories.map((category) => <button type="button" key={category._id} aria-pressed={selected === category.slug} className={selected === category.slug ? "is-active" : ""} onClick={() => changeFilter(category.slug)}>{category.title}</button>)}
    </nav>
    {visibleProjects.length > 0 ? <section className="project-index-grid" aria-label={locale === "en" ? "Projects" : "Projetos"} key={selected}>
      {visibleProjects.map((project, index) => <Link key={project._id} href={`${projectBase}/${project.slug}`} className="project-index-item">
        {project.cover && <figure className="project-index-image" style={project.coverAspectRatio ? { aspectRatio: String(project.coverAspectRatio) } : undefined}><Image src={project.cover} alt={project.title} width={project.coverWidth || 1600} height={project.coverHeight || 1200} sizes="(max-width: 620px) calc(100vw - 36px), (max-width: 800px) 44vw, (max-width: 1500px) 45vw, 750px" quality={90} priority={index === 0} /></figure>}
        <div className="project-index-caption"><h2>{project.title}</h2>
          {(project.category || project.year) && <p>{[project.category, project.year].filter(Boolean).join(" · ")}</p>}
        </div>
      </Link>)}
    </section> : <p className="project-filter-empty" role="status">{labels.noProjectsInCategory}</p>}
  </>;
}
