import type { Metadata } from "next";
import { HomeV4 } from "@/components/home-v4/home-v4";
import "./v4-shell.css";
export const metadata: Metadata = { title: "Home | Jhow.ars", description: "Obras e experimentações visuais de Jhow.ars.", robots: { index: false, follow: false }, alternates: { canonical: "/home-v4", languages: { pt: "/home-v4", en: "/en/home-v4" } } };
export default function Page() { return <HomeV4 locale="pt" />; }
