import type { CSSProperties } from "react";
import type { EditorialGraphic as Graphic } from "./editorial-plan";
import { editorialGeometry as geometry } from "./editorial-svg-geometry";

export function EditorialGraphic({ kind }: { kind: Graphic }) {
  const asset = geometry[kind];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={asset.viewBox} data-graphic={kind} aria-hidden="true" focusable="false">
      {kind === "rectangles" && geometry.rectangles.shapes.map((shape, index) => (
        <rect key={shape.x} {...shape} fill={index % 2 === 0 ? "#ec3925" : "#f9f8f7"}
          data-motion-part="bar" data-pale={index % 2 === 1 || undefined}
          style={{ "--part-delay": `${index * 115}ms` } as CSSProperties} />
      ))}
      {kind === "star" && <>
        <path d={geometry.star.paths[0]} fill="#ffc528" data-motion-part="star" />
        <path d={geometry.star.paths[1]} fill="#000" />
        <path d={geometry.star.paths[2]} fill="#ef382f" />
      </>}
      {kind === "eye" && <>
        <g fill="var(--graphic-ink)" data-static-face>
          {geometry.eye.face.map((path, index) => <path d={path} key={index} />)}
        </g>
        <path d={geometry.eye.paths[0]} fill="var(--graphic-ink)" data-motion-part="eye" />
        <path d={geometry.eye.paths[1]} fill="var(--graphic-paper)" />
        <path d={geometry.eye.paths[2]} fill="var(--graphic-ink)" />
      </>}
      {kind === "dots" && geometry.dots.shapes.map((shape, index) => {
        const row = Math.floor(index / 6);
        const column = index % 6;
        return <circle key={`${shape.cx}:${shape.cy}`} {...shape} fill="var(--graphic-ink)" data-motion-part="dot"
          style={{ "--part-delay": `${(column + row * .72) * 73}ms`, "--dot-y": row % 2 === 0 ? "-5px" : "5px" } as CSSProperties} />;
      })}
    </svg>
  );
}
