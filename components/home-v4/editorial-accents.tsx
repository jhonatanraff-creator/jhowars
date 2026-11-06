import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./home-v4.module.css";

type Placement = readonly [left: number, top: number, width: number];
type Accent = {
  id: string;
  desktop?: Placement;
  mobile?: Placement;
  text?: Record<Locale, string>;
  graphic?: ReactNode;
  darkGraphic?: ReactNode;
  animate?: boolean;
};

// -1 is the opening. Keys 0–4 follow the continuation templates.
// Only configure accents where the template leaves room around the artworks.
const accentsByLayout: Partial<Record<number, readonly Accent[]>> = {};

export function EditorialAccents({ layout, mirror, locale }: { layout: number; mirror: boolean; locale: Locale }) {
  return accentsByLayout[layout]?.map(accent => {
    const [x, y, width] = accent.desktop ?? [0, 0, 0];
    const [mx, my, mobileWidth] = accent.mobile ?? [0, 0, 0];
    const placement = {
      "--accent-x": `${mirror ? 100 - x - width : x}%`,
      "--accent-y": `${y}%`,
      "--accent-width": `${width}%`,
      "--accent-mobile-x": `${mx}%`,
      "--accent-mobile-y": `${my}%`,
      "--accent-mobile-width": `${mobileWidth}%`,
    } as CSSProperties;

    return (
      <div key={accent.id} className={styles.accent} style={placement}
        data-accent-desktop={Boolean(accent.desktop)} data-accent-mobile={Boolean(accent.mobile)}
        data-accent-animate={accent.animate || undefined}>
        {(accent.graphic || accent.darkGraphic) && (
          <div aria-hidden="true">
            <div data-accent-light={accent.darkGraphic ? "" : undefined}>{accent.graphic}</div>
            {accent.darkGraphic && <div data-accent-dark>{accent.darkGraphic}</div>}
          </div>
        )}
        {accent.text?.[locale] && <p>{accent.text[locale]}</p>}
      </div>
    );
  }) ?? null;
}
