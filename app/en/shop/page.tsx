import type { Metadata } from "next";
import { pageMetadata, ShopContent } from "@/components/portfolio-pages";

export async function generateMetadata(): Promise<Metadata> { return pageMetadata("en", "shop"); }
export default function EnglishShopPage() { return <ShopContent locale="en" />; }
