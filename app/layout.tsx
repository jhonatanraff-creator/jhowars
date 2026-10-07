import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/portfolio";
import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { LocaleDocument } from "@/components/locale-document";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale: Locale = requestHeaders.get("x-site-locale") === "en" ? "en" : "pt";
  const settings = await getSiteSettings(locale);
  const title = settings?.seoTitle || settings?.artistName || "Jhow.ars — Visual Artist & Illustrator";
  const description = settings?.seoDescription || "";
  const image = settings?.defaultOgImage;
  return {
    metadataBase: new URL("https://jhowars.com"),
    title: { default: title, template: `%s — ${settings?.artistName || "Jhow.ars"}` },
    description,
    alternates: { canonical: locale === "en" ? "https://jhowars.com/en" : "https://jhowars.com/", languages: { "pt-BR": "https://jhowars.com/", en: "https://jhowars.com/en" } },
    openGraph: { title, description, ...(image ? { images: [image] } : {}), type: "website", locale: locale === "en" ? "en_US" : "pt_BR" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const locale: Locale = requestHeaders.get("x-site-locale") === "en" ? "en" : "pt";
  const [settings, settingsByEn, settingsByPt] = await Promise.all([
    getSiteSettings(locale),
    getSiteSettings("en"),
    getSiteSettings("pt"),
  ]);
  const settingsByLocale = { en: settingsByEn, pt: settingsByPt };
  return <html lang={locale === "en" ? "en" : "pt-BR"}><body><LocaleDocument /><SiteHeader settings={settings} settingsByLocale={settingsByLocale} /><main>{children}</main><Footer settings={settings} settingsByLocale={settingsByLocale} /></body></html>;
}
