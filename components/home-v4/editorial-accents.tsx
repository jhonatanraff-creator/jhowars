import type { CSSProperties } from "react";
import type { planPanel } from "./composition";
import type { Locale } from "@/lib/i18n";
import { EditorialGraphic } from "./editorial-graphic";
import { EditorialPhrase } from "./editorial-phrase";
import styles from "./home-v4.module.css";

type Intervention = NonNullable<ReturnType<typeof planPanel>["editorial"]>;

export function EditorialAccents({ editorial, locale }: { editorial: Intervention | null; locale: Locale }) {
  if (!editorial) return null;
  const [x, y, width] = editorial.desktop;
  const [mx, my, mobileWidth] = editorial.mobile;
  const placement = {
    "--accent-x": `${x}%`, "--accent-y": y, "--accent-width": `${width}%`,
    "--accent-mobile-x": `${mx}%`, "--accent-mobile-y": my, "--accent-mobile-width": `${mobileWidth}%`,
  } as CSSProperties;

  return (
    <div className={styles.accent} style={placement} data-editorial={editorial.id}
      data-paired={Boolean(editorial.phrase && editorial.graphic)}>
      {editorial.graphic && <EditorialGraphic kind={editorial.graphic} />}
      {editorial.phrase && <EditorialPhrase phrase={editorial.phrase} graphic={editorial.graphic} locale={locale} />}
    </div>
  );
}
