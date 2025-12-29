import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-bg-input px-4 py-3 text-base text-text-primary transition-colors duration-200",
            "placeholder:text-text-tertiary",
            "border-border-default focus:border-border-focus focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            error && "border-error focus:border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-sm text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };


