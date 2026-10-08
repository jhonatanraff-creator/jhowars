import type { Metadata } from "next";
import { HomeV2Gallery } from "@/components/home-v2/home-v2-gallery";
import { getHomePosts } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Home V2",
  alternates: {
    canonical: "/en/home-v2",
    languages: { "pt-BR": "/home-v2", en: "/en/home-v2" },
  },
};

export default async function EnglishHomeV2Page() {
  const posts = await getHomePosts("en");
  return <HomeV2Gallery posts={posts} locale="en" />;
}
