import type { Metadata } from "next";
import { ProjectDetailContent, projectMetadata, staticProjectParams } from "@/components/portfolio-pages";

export async function generateStaticParams() { return staticProjectParams(); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return projectMetadata(params, "en"); }
export default function EnglishProjectDetail({ params }: { params: Promise<{ slug: string }> }) { return <ProjectDetailContent params={params} locale="en" />; }
