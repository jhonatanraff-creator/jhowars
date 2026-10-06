import type { Metadata } from "next";
import Image from "next/image";
import { getShopItems } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const items = await getShopItems();
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">Jhow.ars</p><h1>Shop</h1></header>
    {items.length ? <section className="shop-grid">{items.map((item) => <article className="shop-item" key={item._id}>{item.image && <Image src={item.image} alt={item.title} width={720} height={900} />}<h2>{item.title}</h2>{item.descriptionPt && <p>{item.descriptionPt}</p>}{item.price !== undefined && <p>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: item.currency ?? "BRL" }).format(item.price)}</p>}{item.externalUrl && <a href={item.externalUrl}>Ver item ↗</a>}</article>)}</section> : <p className="empty-shop">Nenhum item disponível no momento.</p>}
  </div>;
}
