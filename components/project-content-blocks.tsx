import Image from "next/image";
import type { CSSProperties } from "react";
import type { CmsProjectBlock } from "@/lib/portfolio";
import { projectImageSizes } from "@/lib/project-image-sizes";

type EditorialStyle = CSSProperties & { "--gallery-desktop"?: number; "--gallery-tablet"?: number; "--gallery-mobile"?: number };

const spacingClass = (value: string | undefined, side: "top" | "bottom") => `space-${side}-${["none", "small", "medium", "large"].includes(value || "") ? value : "medium"}`;
const alignmentClass = (value: string | undefined) => `align-${["left", "center", "right"].includes(value || "") ? value : "center"}`;
const widthClass = (value: string | undefined) => `width-${["small", "medium", "large", "full"].includes(value || "") ? value : "full"}`;
const ratioStyle = (ratio?: number): CSSProperties | undefined => ratio && Number.isFinite(ratio) && ratio > 0 ? { aspectRatio: String(ratio) } : undefined;

function Figure({ src, aspectRatio, alt, caption, className = "", sizes = "(max-width: 800px) 92vw, 88vw", priority = false }: { src?: string; aspectRatio?: number; alt?: string; caption?: string; className?: string; sizes?: string; priority?: boolean }) {
  if (!src) return null;
  return <figure className={`project-block-figure ${className}`}>
    <button type="button" className="project-block-image project-lightbox-trigger" style={ratioStyle(aspectRatio)} aria-label={caption || alt ? `Open image: ${caption || alt}` : "Open project image"} data-project-lightbox-image data-lightbox-src={src} data-lightbox-alt={alt || ""} data-lightbox-caption={caption || ""}>
      <Image src={src} alt={alt || ""} fill sizes={sizes} quality={90} priority={priority} />
    </button>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

export function ProjectContentBlocks({ blocks }: { blocks: CmsProjectBlock[] }) {
  const firstImageBlock = blocks.findIndex((block) => ["imageBlock", "fullWidthImageBlock", "galleryBlock", "twoImagesBlock"].includes(block._type));
  return <div className="project-content-blocks">
    {blocks.map((block, index) => {
      const key = block._key || `${block._type}-${index}`;
      const spacing = `${spacingClass(block.spacingTop, "top")} ${spacingClass(block.spacingBottom, "bottom")}`;
      const alignment = alignmentClass(block.alignment);
      switch (block._type) {
        case "textBlock": return <section className={`project-text-block ${widthClass(block.widthStyle || "medium")} ${alignment} ${spacing}`} key={key}>
          {block.heading && <h2>{block.heading}</h2>}
          {block.body?.split("\n\n").filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
        </section>;
        case "imageBlock": return <Figure key={key} src={block.imageUrl} aspectRatio={block.imageAspectRatio} alt={block.alt} caption={block.caption} className={`${widthClass(block.widthStyle)} ${alignment} ${spacing}`} sizes={projectImageSizes(block.widthStyle)} priority={index === firstImageBlock} />;
        case "fullWidthImageBlock": return <Figure key={key} src={block.imageUrl} aspectRatio={block.imageAspectRatio} alt={block.alt} caption={block.caption} className={`width-full ${alignment} ${spacing}`} sizes={projectImageSizes("full")} priority={index === firstImageBlock} />;
        case "galleryBlock": {
          const layout = ["grid", "row", "stack"].includes(block.layout || "") ? block.layout : "grid";
          const gap = ["small", "medium", "large"].includes(block.gap || "") ? block.gap : "small";
          const columns = (value: number | undefined, fallback: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(value || fallback)));
          const style: EditorialStyle = {
            "--gallery-desktop": columns(block.columnsDesktop, 3, 2, 5),
            "--gallery-tablet": columns(block.columnsTablet, 2, 1, 4),
            "--gallery-mobile": columns(block.columnsMobile, 1, 1, 2),
          };
          const columnCount = columns(block.columnsDesktop, 3, 2, 5);
          const gallerySizes = projectImageSizes("full", { columns: layout === "stack" ? undefined : columnCount, stack: layout === "stack" });
          return <section className={`cms-gallery layout-${layout} gap-${gap} ${widthClass(block.widthStyle)} ${alignment} ${spacing}`} style={style} key={key} aria-label="Galeria de imagens">
            {block.images?.map((item, imageIndex) => <Figure key={item._key || `${key}-${imageIndex}`} src={item.image} aspectRatio={item.aspectRatio} alt={item.alt} caption={item.caption} sizes={gallerySizes} priority={index === firstImageBlock && imageIndex === 0} />)}
          </section>;
        }
        case "twoImagesBlock": return <section className={`cms-two-images ${widthClass(block.widthStyle || "full")} ${alignment} ${spacing}`} key={key}>
          <Figure src={block.leftImageUrl} aspectRatio={block.leftImageAspectRatio} alt={block.leftAlt} caption={block.leftCaption} sizes={projectImageSizes("full", { columns: 2 })} priority={index === firstImageBlock} />
          <Figure src={block.rightImageUrl} aspectRatio={block.rightImageAspectRatio} alt={block.rightAlt} caption={block.rightCaption} sizes={projectImageSizes("full", { columns: 2 })} />
        </section>;
        case "mediaBlock": {
          const media = block.mediaUrl || block.externalUrl;
          if (!media) return null;
          const mediaClass = `project-media-block ${widthClass(block.widthStyle)} ${alignment} ${spacing}`;
          if (/\.gif(?:[?#]|$)/i.test(media)) return <figure className={mediaClass} key={key}>
            <button type="button" className="project-gif project-lightbox-trigger" style={ratioStyle(block.imageAspectRatio)} aria-label={block.caption || block.alt ? `Open image: ${block.caption || block.alt}` : "Open project image"} data-project-lightbox-image data-lightbox-src={media} data-lightbox-alt={block.alt || ""} data-lightbox-caption={block.caption || ""}><Image src={media} alt={block.alt || ""} fill unoptimized sizes={projectImageSizes("full")} /></button>
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>;
          if (/\.(mp4|webm|ogg)(?:[?#]|$)/i.test(media)) return <figure className={mediaClass} key={key}>
            <video src={media} aria-label={block.alt || block.caption || "Mídia do projeto"} controls playsInline preload="metadata" />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>;
          return <figure className={mediaClass} key={key}>
            <iframe src={media} title={block.alt || block.caption || "Mídia do projeto"} loading="lazy" allow="fullscreen; picture-in-picture" />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>;
        }
        case "captionBlock": return block.body ? <p className={`project-caption-block ${alignment} ${spacing}`} key={key}>{block.body}</p> : null;
        case "spacerBlock": return <div className={`project-spacer spacer-${block.size || "medium"}`} key={key} aria-hidden="true" />;
        default: return null;
      }
    })}
  </div>;
}
