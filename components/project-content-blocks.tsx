import Image from "next/image";
import type { CmsProjectBlock } from "@/lib/portfolio";

function Figure({ src, alt, caption, sizes = "(max-width: 700px) 90vw, 80vw", className = "" }: { src?: string; alt?: string; caption?: string; sizes?: string; className?: string }) {
  if (!src) return null;
  return <figure className={`project-block-figure ${className}`}><div className="project-block-image"><Image src={src} alt={alt || ""} fill sizes={sizes} /></div>{caption && <figcaption>{caption}</figcaption>}</figure>;
}

export function ProjectContentBlocks({ blocks }: { blocks: CmsProjectBlock[] }) {
  return <div className="project-content-blocks">
    {blocks.map((block, index) => {
      const key = block._key || `${block._type}-${index}`;
      switch (block._type) {
        case "textBlock": return <section className="project-text-block" key={key}>{block.heading && <h2>{block.heading}</h2>}{block.body?.split("\n\n").filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</section>;
        case "imageBlock": return <Figure key={key} src={block.imageUrl} alt={block.alt} caption={block.caption} className={`width-${block.widthStyle || "full"}`} />;
        case "fullWidthImageBlock": return <Figure key={key} src={block.imageUrl} alt={block.alt} caption={block.caption} className="width-full" />;
        case "galleryBlock": return <section className="cms-gallery" key={key} aria-label="Galeria de imagens">{block.images?.map((item, imageIndex) => <Figure key={item._key || `${key}-${imageIndex}`} src={item.image} alt={item.alt} caption={item.caption} sizes="(max-width: 700px) 90vw, 46vw" />)}</section>;
        case "twoImagesBlock": return <section className="cms-two-images" key={key}><Figure src={block.leftImageUrl} alt={block.leftAlt} caption={block.leftCaption} sizes="(max-width: 700px) 90vw, 46vw" /><Figure src={block.rightImageUrl} alt={block.rightAlt} caption={block.rightCaption} sizes="(max-width: 700px) 90vw, 46vw" /></section>;
        case "mediaBlock": {
          const media = block.mediaUrl || block.externalUrl;
          if (!media) return null;
          if (/\.gif(?:[?#]|$)/i.test(media)) return <figure className="project-media-block" key={key}><div className="project-gif"><Image src={media} alt={block.alt || ""} fill unoptimized sizes="96vw" /></div>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
          return <figure className="project-media-block" key={key}><video src={media} aria-label={block.alt || block.caption || "Mídia do projeto"} autoPlay muted loop playsInline controls />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
        }
        case "captionBlock": return block.body ? <p className="project-caption-block" key={key}>{block.body}</p> : null;
        case "spacerBlock": return <div className={`project-spacer spacer-${block.size || "medium"}`} key={key} aria-hidden="true" />;
        default: return null;
      }
    })}
  </div>;
}
