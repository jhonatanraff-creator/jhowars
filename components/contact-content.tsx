import { getSiteSettings } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { InternalPageHeader } from "@/components/internal-page-header";
import styles from "./contact-content.module.css";

export async function ContactContent({locale}:{locale:Locale}) {
  const settings=await getSiteSettings(locale);
  const email=settings?.email || "jhow@jhowars.com";
  const place=settings?.locationLabel || (locale==='en'?'Brazil':'Brasil');
  const availability=settings?.footerAvailability || (locale==='en'?'Available for collaborations, partnerships and creative projects.':'Disponível para colaborações, parcerias e projetos com identidade autoral.');
  return <article className="page-shell about-page">
    <InternalPageHeader label="JHOW.ARS" title={locale==='en'?'CONTACT':'CONTATO'} />
    <div className={styles.content}>
      <section className={styles.primary} aria-labelledby="contact-email-label">
        <p className={styles.kicker} id="contact-email-label">{locale==='en'?'Start a conversation':'Comece uma conversa'}</p>
        <a className={styles.email} href={`mailto:${email}`}>{email}</a>
      </section>
      <dl className={styles.meta}>
        <div><dt>{locale==='en'?'Based in':'Base'}</dt><dd>{place}</dd></div>
        <div><dt>{locale==='en'?'Collaborations':'Colaborações'}</dt><dd>{availability}</dd></div>
        <div><dt>{locale==='en'?'Elsewhere':'Redes'}</dt><dd><nav className={styles.social} aria-label={locale==='en'?'Social media':'Redes sociais'}>{(['instagram','behance','linkedin'] as const).map(kind=>settings?.[kind]?<a key={kind} href={settings[kind]} target="_blank" rel="noopener noreferrer">{kind==='linkedin'?'LinkedIn':kind==='behance'?'Behance':'Instagram'}</a>:null)}</nav></dd></div>
      </dl>
    </div>
  </article>;
}
