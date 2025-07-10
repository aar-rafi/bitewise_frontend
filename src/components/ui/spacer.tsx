import * as React from "react"
import { Box, BoxProps } from "./box"

const Spacer = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ ...props }, ref) => {
    return (
      <Box
        ref={ref}
        flex="1"
        {...props}
      />
    );
  }
);

Spacer.displayName = "Spacer";

export { Spacer }; 