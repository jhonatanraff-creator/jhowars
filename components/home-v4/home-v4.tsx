import { getHomePosts, getSiteSettings } from "@/lib/portfolio";
import type { Locale } from "@/lib/i18n";
import { Gallery } from "./gallery";

const themeBoot = `try{var t=localStorage.getItem('jhow-v4-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)){var s=document.createElement('style');s.id='v4-initial-theme';s.textContent='[data-v4-shell]{--paper:#171716;--ink:#eeece6;--muted:#b9b5ab;--line:#45433d;--proof:#222220;--brand-filter:invert(1)}';document.head.appendChild(s)}}catch(e){}`;

export async function HomeV4({ locale }: { locale: Locale }) {
  const [posts, settings] = await Promise.all([getHomePosts(locale), getSiteSettings(locale)]);
  return <><script dangerouslySetInnerHTML={{ __html: themeBoot }} /><Gallery posts={posts} locale={locale} settings={settings} /></>;
}
