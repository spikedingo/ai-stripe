import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border bg-bg-input px-4 py-3 text-base text-text-primary transition-colors duration-200",
            "placeholder:text-text-tertiary",
            "border-border-default focus:border-border-focus focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };


