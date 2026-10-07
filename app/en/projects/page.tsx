import type { Metadata } from "next";
import { pageMetadata, ProjectsContent } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("en", "projects"); }
export default function EnglishProjectsPage() { return <ProjectsContent locale="en" />; }
