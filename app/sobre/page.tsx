import type { Metadata } from "next";
import Image from "next/image";
import { getAboutPage } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Sobre" };

export default async function AboutPage() {
  const about = await getAboutPage();
  const paragraphs = about?.bio?.split("\n\n").filter(Boolean) ?? [];
  return <article className="about-page page-shell">
    <p className="eyebrow">Jhow.ars · Visual artist & illustrator · Brazil</p><h1>Sobre</h1>
    {about?.portrait && <figure className="about-portrait"><Image src={about.portrait} alt="Retrato de Jhow.ars" fill sizes="(max-width: 700px) 90vw, 40vw" /></figure>}
    <div className="about-copy">
      {about?.intro && <p className="about-intro">{about.intro}</p>}
      {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
    </div>
    {about?.circulation?.length ? <section className="about-section"><p className="eyebrow">Circulação</p><ul className="circulation-list">{about.circulation.map((item, index) => <li key={`${item.name}-${index}`}><h2>{item.name}</h2><p>{[item.organization, [item.city, item.state].filter(Boolean).join(" · "), item.years?.join(", ")].filter(Boolean).join(" · ")}</p>{item.description && <p>{item.description}</p>}{item.link && <a href={item.link}>{item.link} ↗</a>}</li>)}</ul></section> : null}
    {about?.clients?.length ? <section className="about-section"><p className="eyebrow">Clientes</p><p>{about.clients.join(" · ")}</p></section> : null}
    {about?.press?.length ? <section className="about-section"><p className="eyebrow">Imprensa</p><ul>{about.press.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section> : null}
    {about?.additionalSections?.map((section, index) => <section className="about-section" key={`${section.heading || "section"}-${index}`}><p className="eyebrow">{section.heading}</p><div className="additional-copy">{section.body?.split("\n").filter(Boolean).map((line, lineIndex) => <p key={`${lineIndex}-${line.slice(0, 20)}`}>{line}</p>)}</div></section>)}
  </article>;
}
