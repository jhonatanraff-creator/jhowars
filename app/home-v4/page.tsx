import type { Metadata } from "next";
import { HomeV4 } from "@/components/home-v4/home-v4";
import "./v4-shell.css";
export const metadata: Metadata = { title: "Home V4", robots: { index: false, follow: false } };
export default function Page() { return <HomeV4 locale="pt" />; }
