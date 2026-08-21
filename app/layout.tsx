import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MotionLayer } from "@/components/motion-layer";
import { PageMotion } from "@/components/page-motion";
import { UiPreferences } from "@/components/ui-preferences";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jhowars.com"),
  title: { default: "Jhow.Ars — Artista visual & designer", template: "%s — Jhow.Ars" },
  description: "Portfólio de Jhow.Ars, artista visual, ilustrador e designer brasileiro.",
  keywords: ["Jhow Ars", "artista visual", "ilustração", "design", "arte brasileira"],
  openGraph: { title: "Jhow.Ars — Artista visual & designer", description: "Obras, imagens e projetos de Jhow.Ars.", type: "website", locale: "pt_BR" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head><script dangerouslySetInnerHTML={{__html:`(()=>{const saved=localStorage.getItem("jhowars-theme");const theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme})()`}} /></head>
      <body id="top">
        <UiPreferences>
          <Header />
          <MotionLayer />
          <main><PageMotion>{children}</PageMotion></main>
          <Footer />
        </UiPreferences>
      </body>
    </html>
  );
}
