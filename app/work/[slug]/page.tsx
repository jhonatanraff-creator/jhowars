import { permanentRedirect } from "next/navigation";

export default async function LegacyProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/projetos/${slug}`);
}
