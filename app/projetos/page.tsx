import type { Metadata } from "next";
import { pageMetadata, ProjectsContent } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("pt", "projects"); }
export default function ProjectsPage() { return <ProjectsContent locale="pt" />; }
