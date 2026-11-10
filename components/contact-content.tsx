import { getSiteSettings } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";

export async function ContactContent({locale}:{locale:Locale}) {
  const settings=await getSiteSettings(locale);
  const email=settings?.email || "jhow@jhowars.com";
  return <article className="page-shell about-page"><h1>{locale==='en'?'Contact':'Contato'}</h1><p><a href={`mailto:${email}`}>{email}</a></p>{settings?.locationLabel&&<p>{settings.locationLabel}</p>}<nav aria-label={locale==='en'?'Social media':'Redes sociais'} style={{display:'flex',gap:24,flexWrap:'wrap'}}>{(['instagram','behance','linkedin'] as const).map(kind=>settings?.[kind]?<a key={kind} href={settings[kind]} target="_blank" rel="noopener noreferrer">{kind==='linkedin'?'LinkedIn':kind==='behance'?'Behance':'Instagram'}</a>:null)}</nav></article>;
}
