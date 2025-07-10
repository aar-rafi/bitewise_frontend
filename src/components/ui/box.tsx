import * as React from "react"
import { cn } from "@/lib/utils"

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  p?: string | number;
  m?: string | number;
  px?: string | number;
  py?: string | number;
  mx?: string | number;
  my?: string | number;
  // Adding individual margin/padding props
  mt?: string | number;
  mb?: string | number;
  ml?: string | number;
  mr?: string | number;
  pt?: string | number;
  pb?: string | number;
  pl?: string | number;
  pr?: string | number;
  w?: string | number;
  h?: string | number;
  bg?: string;
  color?: string;
  border?: string;
  borderRadius?: string | number;
  display?: string;
  flex?: string | number;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  gap?: string | number;
  textAlign?: "left" | "center" | "right" | "justify";
  fontSize?: string | number;
  fontWeight?: string | number;
  maxWidth?: string | number;
  minWidth?: string | number;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  zIndex?: number;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    as: Component = "div",
    className,
    p, m, px, py, mx, my,
    mt, mb, ml, mr, pt, pb, pl, pr,
    w, h, bg, color, border, borderRadius,
    display, flex, flexDirection, alignItems, justifyContent, gap,
    textAlign, fontSize, fontWeight,
    maxWidth, minWidth,
    position, top, left, right, bottom, zIndex,
    style,
    ...props 
  }, ref) => {
    
    const boxStyle: React.CSSProperties = {
      // Spacing
      ...(p && { padding: typeof p === 'number' ? `${p}rem` : p }),
      ...(m && { margin: typeof m === 'number' ? `${m}rem` : m }),
      ...(px && { paddingLeft: typeof px === 'number' ? `${px}rem` : px, paddingRight: typeof px === 'number' ? `${px}rem` : px }),
      ...(py && { paddingTop: typeof py === 'number' ? `${py}rem` : py, paddingBottom: typeof py === 'number' ? `${py}rem` : py }),
      ...(mx && { marginLeft: typeof mx === 'number' ? `${mx}rem` : mx, marginRight: typeof mx === 'number' ? `${mx}rem` : mx }),
      ...(my && { marginTop: typeof my === 'number' ? `${my}rem` : my, marginBottom: typeof my === 'number' ? `${my}rem` : my }),
      
      // Individual spacing
      ...(mt && { marginTop: typeof mt === 'number' ? `${mt}rem` : mt }),
      ...(mb && { marginBottom: typeof mb === 'number' ? `${mb}rem` : mb }),
      ...(ml && { marginLeft: typeof ml === 'number' ? `${ml}rem` : ml }),
      ...(mr && { marginRight: typeof mr === 'number' ? `${mr}rem` : mr }),
      ...(pt && { paddingTop: typeof pt === 'number' ? `${pt}rem` : pt }),
      ...(pb && { paddingBottom: typeof pb === 'number' ? `${pb}rem` : pb }),
      ...(pl && { paddingLeft: typeof pl === 'number' ? `${pl}rem` : pl }),
      ...(pr && { paddingRight: typeof pr === 'number' ? `${pr}rem` : pr }),
      
      // Size
      ...(w && { width: typeof w === 'number' ? `${w}rem` : w }),
      ...(h && { height: typeof h === 'number' ? `${h}rem` : h }),
      ...(maxWidth && { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}rem` : maxWidth }),
      ...(minWidth && { minWidth: typeof minWidth === 'number' ? `${minWidth}rem` : minWidth }),
      
      // Colors & Borders
      ...(bg && { backgroundColor: bg }),
      ...(color && { color }),
      ...(border && { border }),
      ...(borderRadius && { borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius }),
      
      // Layout
      ...(display && { display }),
      ...(flex && { flex: typeof flex === 'number' ? flex : flex }),
      ...(flexDirection && { flexDirection }),
      ...(alignItems && { alignItems }),
      ...(justifyContent && { justifyContent }),
      ...(gap && { gap: typeof gap === 'number' ? `${gap}rem` : gap }),
      
      // Typography
      ...(textAlign && { textAlign }),
      ...(fontSize && { fontSize: typeof fontSize === 'number' ? `${fontSize}rem` : fontSize }),
      ...(fontWeight && { fontWeight }),
      
      // Position
      ...(position && { position }),
      ...(top && { top: typeof top === 'number' ? `${top}px` : top }),
      ...(left && { left: typeof left === 'number' ? `${left}px` : left }),
      ...(right && { right: typeof right === 'number' ? `${right}px` : right }),
      ...(bottom && { bottom: typeof bottom === 'number' ? `${bottom}px` : bottom }),
      ...(zIndex && { zIndex }),
      
      ...style
    };

    return (
      <Component
        ref={ref}
        className={cn(className)}
        style={boxStyle}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";

export { Box, type BoxProps }; 