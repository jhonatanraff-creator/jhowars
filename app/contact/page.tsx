import type { Metadata } from "next";
import { UiText } from "@/components/ui-preferences";

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
        <p className="eyebrow"><UiText id="contactEyebrow"/></p>
        <h1><UiText id="write"/></h1>
        <p><UiText id="contactIntro"/></p>
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
