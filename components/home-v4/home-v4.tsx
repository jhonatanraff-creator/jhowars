import { getHomePosts, getSiteSettings } from "@/lib/portfolio";
import { fallbackSiteSettings } from "@/data/legacy-cms";
import type { Locale } from "@/lib/i18n";
import { Gallery } from "./gallery";

const themeBoot = `try{var t=localStorage.getItem('jhow-v4-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)){var s=document.createElement('style');s.id='v4-initial-theme';s.textContent='html:has([data-v4-shell]),body:has([data-v4-shell]){background:#171716;color-scheme:dark}[data-v4-shell]{--paper:#171716;--ink:#eeece6;--muted:#b9b5ab;--line:#45433d;--proof:#222220;--brand-filter:invert(1)}';document.head.appendChild(s)}}catch(e){}`;

export async function HomeV4({ locale }: { locale: Locale }) {
  const [posts, settings] = await Promise.all([getHomePosts(locale), getSiteSettings(locale)]);
  const links = {
    ...settings,
    instagram: settings?.instagram || fallbackSiteSettings.instagram,
    behance: settings?.behance || fallbackSiteSettings.behance,
    linkedin: settings?.linkedin || fallbackSiteSettings.linkedin,
  };
  return <><script dangerouslySetInnerHTML={{ __html: themeBoot }} /><Gallery posts={posts} locale={locale} settings={links} /></>;
}
