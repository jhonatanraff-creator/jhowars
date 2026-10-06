import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhowars.com"),
  title: { default: "Jhow.ars — Visual Artist & Illustrator", template: "%s — Jhow.ars" },
  description: "Visual artist and designer focused on illustration, print editions, art books, zines and experimental visual projects. Authorial portfolio by Jhow.ars.",
  openGraph: { title: "Jhow.ars — Visual Artist & Illustrator", description: "Visual artist and designer focused on illustration, print editions, art books, zines and experimental visual projects. Authorial portfolio by Jhow.ars.", type: "website", locale: "pt_BR" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteHeader /><main>{children}</main></body></html>;
}
