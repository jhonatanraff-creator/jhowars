import type { CSSProperties } from "react";
import { graphicBounds, type planPanel } from "./composition";
import { editorialGeometry } from "./editorial-svg-geometry";
import type { Locale } from "@/lib/i18n";
import { EditorialGraphic } from "./editorial-graphic";
import { EditorialPhrase } from "./editorial-phrase";
import styles from "./home-v4.module.css";

type Intervention = NonNullable<ReturnType<typeof planPanel>["editorial"]>;

export function EditorialAccents({ editorial, locale }: { editorial: Intervention | null; locale: Locale }) {
  if (!editorial) return null;
  const { box, graphicWidth, graphicHeight } = editorial;
  const placement = {left:box.x,top:box.y,width:box.width,height:box.height};
  let crop: CSSProperties = {};
  if (editorial.graphic) {
    const bounds = graphicBounds[editorial.graphic];
    const scale = graphicWidth / bounds[2];
    const viewWidth = Number(editorialGeometry[editorial.graphic].viewBox.split(" ")[2]);
    crop = {width:graphicWidth,height:graphicHeight,"--svg-width":viewWidth * scale + "px","--svg-x":-bounds[0] * scale + "px","--svg-y":-bounds[1] * scale + "px"} as CSSProperties;
  }

  return (
    <div className={styles.accent} style={placement} data-editorial={editorial.id} data-envelope={JSON.stringify(editorial.protectedBox)}
      data-paired={Boolean(editorial.phrase && editorial.graphic)}>
      {editorial.graphic && <div className={styles.graphicCrop} style={crop}><EditorialGraphic kind={editorial.graphic} /></div>}
      {editorial.phrase && <EditorialPhrase phrase={editorial.phrase} graphic={editorial.graphic} locale={locale} />}
    </div>
  );
}
