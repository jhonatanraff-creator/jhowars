import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/projetos", permanent: true },
      { source: "/work/:slug", destination: "/projetos/:slug", permanent: true },
      { source: "/bestas-do-dia-brazilian-wildlife", destination: "/projetos/bestas-do-dia-brazilian-wildlife", permanent: true },
      { source: "/bumba-meu-boi", destination: "/projetos/bumba-meu-boi", permanent: true },
      { source: "/corpos-graficos", destination: "/projetos/corpos-graficos", permanent: true },
      { source: "/countenance-illustration", destination: "/projetos/countenance-illustration", permanent: true },
      { source: "/fogo-fossil", destination: "/projetos/fogo-fossil", permanent: true },
      { source: "/o-que-fica-project-editorial", destination: "/projetos/o-que-fica-project-editorial", permanent: true },
      { source: "/posters-2024-experimental-print-and-illustration", destination: "/projetos/posters-2024-experimental-print-and-illustration", permanent: true },
      { source: "/veja-saude-editorial-illustration", destination: "/projetos/veja-saude-editorial-illustration", permanent: true },
      { source: "/about", destination: "/sobre", permanent: true },
      { source: "/contact", destination: "/sobre", permanent: true },
      { source: "/contato", destination: "/sobre", permanent: true },
    ];
  },
};

export default nextConfig;
