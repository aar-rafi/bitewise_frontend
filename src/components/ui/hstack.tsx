import * as React from "react"
import { Box, BoxProps } from "./box"

interface HStackProps extends Omit<BoxProps, 'display' | 'flexDirection'> {
  spacing?: string | number;
}

const HStack = React.forwardRef<HTMLDivElement, HStackProps>(
  ({ children, spacing, gap, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection="row"
        gap={spacing || gap}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

HStack.displayName = "HStack";

export { HStack, type HStackProps }; 