import type { Metadata } from "next";
import { AboutContent, pageMetadata } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("en", "about"); }
export default function EnglishAboutPage() { return <AboutContent locale="en" />; }
