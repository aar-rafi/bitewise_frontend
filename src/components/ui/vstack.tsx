import * as React from "react"
import { Box, BoxProps } from "./box"

interface VStackProps extends Omit<BoxProps, 'display' | 'flexDirection'> {
  spacing?: string | number;
}

const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ children, spacing, gap, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection="column"
        gap={spacing || gap}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

VStack.displayName = "VStack";

export { VStack, type VStackProps }; 