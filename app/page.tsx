import { ArtworkWall } from "@/components/artwork-wall";
import { getHomePosts } from "@/lib/portfolio";

export default async function HomePage() {
  const homePosts = await getHomePosts();
  return <div className="home-page"><ArtworkWall homePosts={homePosts} /></div>;
}
