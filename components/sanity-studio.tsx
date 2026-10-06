"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export function SanityStudio() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return <section className="studio-empty"><h1>Sanity Studio</h1><p>Configure as variáveis do Sanity para conectar este Studio ao projeto.</p></section>;
  return <NextStudio config={config} />;
}
