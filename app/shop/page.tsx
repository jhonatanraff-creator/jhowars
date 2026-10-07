import type { Metadata } from "next";
import { pageMetadata, ShopContent } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("pt", "shop"); }
export default function ShopPage() { return <ShopContent locale="pt" />; }
