import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Entre em contato com Jhow.Ars." };

const contacts = [
  { label: "E-mail", value: "oi@jhowars.com", href: "mailto:oi@jhowars.com" },
  { label: "Instagram", value: "@jhowars", href: "https://instagram.com/jhowars" },
  { label: "Behance", value: "/jhowars", href: "https://behance.net/jhowars" },
];

export default function ContactPage() {
  return (
    <div className="page-shell contact-page">
      <header>
        <p className="eyebrow">Contact / Londrina — Brasil</p>
        <h1>Escreva.</h1>
        <p>Para projetos, colaborações, exposições ou conversas sobre imagem e impressão.</p>
      </header>
      <div className="contact-list">
        {contacts.map((contact, index) => (
          <a key={contact.label} href={contact.href} target={contact.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            <span>{String(index + 1).padStart(2, "0")} · {contact.label}</span>
            <strong>{contact.value}</strong><i>↗</i>
          </a>
        ))}
      </div>
    </div>
  );
}
