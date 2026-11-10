"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsProject, CmsProjectCategory } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import styles from "./project-listing.module.css";

type SortMode = "curation" | "year-desc" | "year-asc" | "title-asc";

const sortModes: SortMode[] = ["curation", "year-desc", "year-asc", "title-asc"];
const legacyCategorySlug = (value: string) => `legacy-${value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

export function ProjectListing({ projects, locale, labels }: { projects: CmsProject[]; locale: Locale; labels: { all: string; noProjectsInCategory: string } }) {
  const [selected, setSelected] = useState("");
  const [sort, setSort] = useState<SortMode>("curation");
  const readUrl = useCallback(() => {
    const params = new URL(window.location.href).searchParams;
    const requestedSort = params.get("order") as SortMode | null;
    setSelected(params.get("category") || "");
    setSort(requestedSort && sortModes.includes(requestedSort) ? requestedSort : "curation");
  }, []);
  useEffect(() => {
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, [readUrl]);

  const sortedCategories = useMemo(() => {
    const categories = new Map<string, CmsProjectCategory>();
    for (const project of projects) {
      if (project.showInProjects === false) continue;
      const referenced = (project.categories || []).filter((category) => category.enabled !== false && category.slug);
      if (referenced.length) {
        for (const category of referenced) categories.set(category.slug, category);
      } else if (project.category) {
        const slug = legacyCategorySlug(project.category);
        categories.set(slug, { _id: slug, title: project.category, slug, enabled: true });
      }
    }
    return [...categories.values()].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.title.localeCompare(b.title, locale === "en" ? "en" : "pt-BR", { sensitivity: "base" }));
  }, [locale, projects]);
  const visibleProjects = useMemo(() => {
    const originalOrder = new Map(projects.map((project, index) => [project._id, index]));
    const filtered = projects.filter((project) => {
      if (project.showInProjects === false) return false;
      if (!selected) return true;
      const referenced = (project.categories || []).filter((category) => category.enabled !== false && category.slug);
      return referenced.length ? referenced.some((category) => category.slug === selected) : Boolean(project.category && legacyCategorySlug(project.category) === selected);
    });
    const title = (a: CmsProject, b: CmsProject) => a.title.localeCompare(b.title, locale === "en" ? "en" : "pt-BR", { sensitivity: "base" });
    const stable = (a: CmsProject, b: CmsProject) => (originalOrder.get(a._id) ?? 0) - (originalOrder.get(b._id) ?? 0) || title(a, b);
    return [...filtered].sort((a, b) => {
      if (sort === "year-desc") return (b.year ?? -Infinity) - (a.year ?? -Infinity) || stable(a, b);
      if (sort === "year-asc") return (a.year ?? Infinity) - (b.year ?? Infinity) || stable(a, b);
      if (sort === "title-asc") return title(a, b) || stable(a, b);
      return (a.archiveOrder ?? Infinity) - (b.archiveOrder ?? Infinity) || stable(a, b);
    });
  }, [locale, projects, selected, sort]);
  const projectBase = locale === "en" ? "/en/projects" : "/projetos";
  const updateUrl = (category: string, order: SortMode) => {
    const url = new URL(window.location.href);
    if (category) url.searchParams.set("category", category);
    else url.searchParams.delete("category");
    if (order !== "curation") url.searchParams.set("order", order);
    else url.searchParams.delete("order");
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const changeFilter = (slug: string) => {
    updateUrl(slug, sort);
    setSelected(slug);
  };
  const changeSort = (order: SortMode) => {
    updateUrl(selected, order);
    setSort(order);
  };
  const text = locale === "en" ? {
    filters: "Filter projects by category", sort: "Sort", curation: "Curation", yearDesc: "Year, newest first", yearAsc: "Year, oldest first", title: "Title A–Z", result: "project", results: "projects",
  } : {
    filters: "Filtrar projetos por categoria", sort: "Ordenar", curation: "Curadoria", yearDesc: "Ano decrescente", yearAsc: "Ano crescente", title: "Título A–Z", result: "projeto", results: "projetos",
  };

  return <>
    <div className={styles.toolbar}>
      <nav className={styles.filters} aria-label={text.filters}>
        <button type="button" aria-pressed={!selected} className={styles.pill} onClick={() => changeFilter("")}>{labels.all}</button>
        {sortedCategories.map((category) => <button type="button" key={category._id} aria-pressed={selected === category.slug} className={styles.pill} onClick={() => changeFilter(category.slug)}>{category.title}</button>)}
      </nav>
      <div className={styles.sort}>
        <label htmlFor="project-sort">{text.sort}</label>
        <select id="project-sort" className={styles.select} value={sort} onChange={(event) => changeSort(event.target.value as SortMode)}>
          <option value="curation">{text.curation}</option>
          <option value="year-desc">{text.yearDesc}</option>
          <option value="year-asc">{text.yearAsc}</option>
          <option value="title-asc">{text.title}</option>
        </select>
      </div>
    </div>
    <p className={styles.count} aria-live="polite">{visibleProjects.length} {visibleProjects.length === 1 ? text.result : text.results}</p>
    {visibleProjects.length > 0 ? <section className={`project-index-grid ${styles.grid}`} aria-label={locale === "en" ? "Projects" : "Projetos"} key={`${selected}-${sort}`}>
      {visibleProjects.map((project, index) => <Link key={project._id} href={`${projectBase}/${project.slug}`} className="project-index-item">
        {project.cover && <figure className="project-index-image" style={project.coverAspectRatio ? { aspectRatio: String(project.coverAspectRatio) } : undefined}><Image src={project.cover} alt={project.title} width={project.coverWidth || 1600} height={project.coverHeight || 1200} sizes="(max-width: 620px) calc(100vw - 36px), (max-width: 800px) 44vw, (max-width: 1500px) 45vw, 750px" quality={90} priority={index === 0} /></figure>}
        <div className="project-index-caption"><h2>{project.title}</h2>
          {(project.category || project.year) && <p>{[project.category, project.year].filter(Boolean).join(" · ")}</p>}
        </div>
      </Link>)}
    </section> : <p className="project-filter-empty" role="status">{labels.noProjectsInCategory}</p>}
  </>;
}
