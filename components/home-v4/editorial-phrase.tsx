import type { CSSProperties } from "react";
import type { Phrase } from "./editorial-plan";
import type { Locale } from "@/lib/i18n";
import styles from "./home-v4.module.css";

export function EditorialPhrase({ phrase, graphic, locale }: { phrase: Phrase; graphic?: string; locale: Locale }) {
  const text = locale === "en" ? phrase.en : phrase.text;
  const words = phrase.motion === "words" ? text.split(" ") : null;
  return (
    <p className={styles.editorialPhrase} lang={locale === "en" ? "en" : "pt-BR"} data-phrase={phrase.id}
      data-align={phrase.align} data-scale={phrase.scale} data-style={phrase.style}
      data-phrase-motion={phrase.motion} data-related-graphic={graphic}>
      {words ? (
        <span aria-hidden="true">
          {words.map((word, index) => (
            <span key={index} data-word style={{ "--word-delay": `${index * 45}ms` } as CSSProperties}>{word}{index < words.length - 1 ? " " : ""}</span>
          ))}
        </span>
      ) : <span data-line>{text}</span>}
      {words && <span className={styles.visuallyHidden}>{text}</span>}
    </p>
  );
}
