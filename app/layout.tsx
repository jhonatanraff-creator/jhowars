import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/portfolio";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.seoTitle || settings?.artistName || "Jhow.ars — Visual Artist & Illustrator";
  const description = settings?.seoDescription || "";
  const image = settings?.defaultOgImage;
  return {
    metadataBase: new URL("https://jhowars.com"),
    title: { default: title, template: `%s — ${settings?.artistName || "Jhow.ars"}` },
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}), type: "website", locale: "pt_BR" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return <html lang="pt-BR"><body><SiteHeader settings={settings} /><main>{children}</main><Footer settings={settings} /></body></html>;
}
