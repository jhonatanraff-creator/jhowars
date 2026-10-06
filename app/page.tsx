import { ArtworkWall } from "@/components/artwork-wall";
import { getArtworks, getProjects } from "@/lib/portfolio";

export default async function HomePage() {
  const [artworks, projects] = await Promise.all([getArtworks(), getProjects()]);
  return <div className="home-page"><ArtworkWall artworks={artworks} projects={projects} /></div>;
}
