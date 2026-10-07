type WidthStyle = "small" | "medium" | "large" | "full" | undefined;

export function projectImageSizes(widthStyle: WidthStyle, options: { columns?: number; stack?: boolean } = {}) {
  const size = widthStyle === "small" ? { breakpoint: 1548, factor: .46, max: 690 }
    : widthStyle === "medium" ? { breakpoint: 1460, factor: .68, max: 960 }
      : widthStyle === "large" ? { breakpoint: 1477, factor: .84, max: 1200 }
        : { breakpoint: 1548, factor: 1, max: 1500 };
  const columns = options.columns && !options.stack ? Math.max(1, Math.round(options.columns)) : 1;
  const desktop = `(max-width: ${size.breakpoint}px) calc((100vw - 48px) * ${size.factor} / ${columns}), ${Math.ceil(size.max / columns)}px`;
  const mobileColumns = options.stack ? 1 : Math.max(1, options.columns || 1);
  const mobile = mobileColumns > 1 ? `calc((100vw - 48px) / ${mobileColumns})` : "calc(100vw - 48px)";
  return `(max-width: 800px) ${mobile}, ${desktop}`;
}
