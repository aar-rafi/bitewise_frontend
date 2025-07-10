import * as React from "react"
import { Box, BoxProps } from "./box"

interface FlexProps extends Omit<BoxProps, 'display'> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    children, 
    direction, 
    wrap, 
    align, 
    justify, 
    flexDirection,
    alignItems,
    justifyContent,
    ...props 
  }, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection={direction || flexDirection}
        alignItems={align || alignItems}
        justifyContent={justify || justifyContent}
        style={{
          flexWrap: wrap,
          ...props.style
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Flex.displayName = "Flex";

export { Flex, type FlexProps }; 