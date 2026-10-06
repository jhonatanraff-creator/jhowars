import type { Metadata } from "next";
import Image from "next/image";
import { getShopItems } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const items = await getShopItems();
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">Jhow.ars</p><h1>Shop</h1></header>
    {items.length ? <section className="shop-grid" aria-label="Produtos">
      {items.map((item) => <article className="shop-item" key={item._id}>
        <div className="shop-images">{item.productImages.filter((image) => image.image).map((image, index) => <figure key={image._key || `${item._id}-${index}`}><Image src={image.image!} alt={image.alt || item.title} width={960} height={1200} sizes="(max-width: 700px) 90vw, 45vw" /><figcaption>{image.caption}</figcaption></figure>)}</div>
        <div className="shop-info"><h2>{item.title}</h2>
          {item.technique && <p>{item.technique}</p>}{item.dimensions && <p>{item.dimensions}</p>}{item.edition && <p>{item.edition}</p>}{item.descriptionPt && <p className="shop-description">{item.descriptionPt}</p>}
          {item.availability === "available" ? <>{item.price !== undefined && <p className="shop-price">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: item.currency ?? "BRL" }).format(item.price)}</p>}{item.ramonaUrl && <a className="shop-cta" href={item.ramonaUrl} target="_blank" rel="noreferrer">Comprar na Ramona ↗</a>}</> : <p className="shop-status">{item.availability === "sold-out" ? "Esgotado" : "Em breve"}</p>}
        </div>
      </article>)}
    </section> : <p className="empty-shop">Novas edições em breve.</p>}
  </div>;
}
