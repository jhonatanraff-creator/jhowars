import type { Metadata } from "next";
import { AboutContent, pageMetadata } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("pt", "about"); }
export default function AboutPage() { return <AboutContent locale="pt" />; }
