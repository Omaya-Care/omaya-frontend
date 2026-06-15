import * as React from "react";

import { cn } from "@/lib/utils";
export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, containerClassName, fullWidth, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "flex flex-col",
          fullWidth ? "w-full" : "w-auto",
          containerClassName,
        )}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
