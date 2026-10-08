import type { Metadata } from "next";
import { HomeV2Gallery } from "@/components/home-v2/home-v2-gallery";
import { getHomePosts } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Home V2",
  alternates: {
    canonical: "/home-v2",
    languages: { "pt-BR": "/home-v2", en: "/en/home-v2" },
  },
};

export default async function HomeV2Page() {
  const posts = await getHomePosts("pt");
  return <HomeV2Gallery posts={posts} locale="pt" />;
}
