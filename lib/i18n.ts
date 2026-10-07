export type Locale = "pt" | "en";

export const copy = {
  pt: {
    projects: "Projetos", about: "Sobre", shop: "Shop", archive: "Arquivo", artwork: "Obra",
    fullProject: "Ver projeto completo", soldOut: "Esgotado", comingSoon: "Em breve", buy: "Comprar na Ramona",
    availableFor: "Disponível para", previous: "Anterior", next: "Próximo", close: "Fechar",
    circulation: "Circulação", clients: "Clientes", press: "Imprensa", noProjects: "Nenhum projeto disponível.",
    shopComing: "Novas edições em breve.", basedIn: "Based in", footerAvailability: "Disponível para: colaborações, parcerias e projetos com identidade autoral",
    home: "Jhow.ars — início", navigation: "Navegação principal", menuOpen: "Abrir menu", menuClose: "Fechar menu",
  },
  en: {
    projects: "Projects", about: "About", shop: "Shop", archive: "Archive", artwork: "Artwork",
    fullProject: "View full project", soldOut: "Sold out", comingSoon: "Coming soon", buy: "Buy at Ramona",
    availableFor: "Available for", previous: "Previous", next: "Next", close: "Close",
    circulation: "Circulation", clients: "Clients", press: "Press", noProjects: "No projects available.",
    shopComing: "New editions coming soon.", basedIn: "Based in", footerAvailability: "Available for: collaborations, partnerships and projects with a distinct identity",
    home: "Jhow.ars — home", navigation: "Main navigation", menuOpen: "Open menu", menuClose: "Close menu",
  },
} as const;

export function getLocalized<T = string>(value: unknown, locale: Locale): T | undefined {
  if (typeof value === "string") return value as T;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const chosen = record[locale] ?? record.pt ?? record.en;
  return (chosen == null ? undefined : chosen) as T | undefined;
}

export function localizeTree<T>(value: T, locale: Locale): T {
  if (Array.isArray(value)) return value.map((entry) => localizeTree(entry, locale)) as T;
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const isLocalized = keys.some((key) => key === "pt" || key === "en") && keys.every((key) => ["pt", "en", "_type", "_key"].includes(key));
  if (isLocalized) return localizeTree((record[locale] ?? record.pt ?? record.en) as T, locale);
  return Object.fromEntries(Object.entries(record).map(([key, child]) => [key, localizeTree(child, locale)])) as T;
}

const routeMap = [
  [/^\/$/, "/en"], [/^\/en$/, "/"],
  [/^\/projetos$/, "/en/projects"], [/^\/en\/projects$/, "/projetos"],
  [/^\/sobre$/, "/en/about"], [/^\/en\/about$/, "/sobre"],
  [/^\/shop$/, "/en/shop"], [/^\/en\/shop$/, "/shop"],
  [/^\/projetos\/([^/]+)$/, "/en/projects/$1"], [/^\/en\/projects\/([^/]+)$/, "/projetos/$1"],
] as const;

export function counterpartPath(pathname: string, locale: Locale): string {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (locale === "en") {
    if (clean === "/en" || clean.startsWith("/en/")) return clean;
    const rule = routeMap.find(([pattern]) => pattern.test(clean));
    return rule ? clean.replace(rule[0], rule[1]) : "/en";
  }
  if (clean !== "/en" && !clean.startsWith("/en/")) return clean;
  const match = routeMap.find(([pattern]) => pattern.test(clean) && pattern.source.startsWith("^\\/en"));
  return match ? clean.replace(match[0], match[1]) : "/";
}

export function localizedHref(path: string, locale: Locale) {
  return counterpartPath(path, locale);
}
