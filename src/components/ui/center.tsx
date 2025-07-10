import * as React from "react"
import { Box, BoxProps } from "./box"

const Center = React.forwardRef<HTMLDivElement, Omit<BoxProps, 'display' | 'alignItems' | 'justifyContent'>>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        alignItems="center"
        justifyContent="center"
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Center.displayName = "Center";

export { Center }; 