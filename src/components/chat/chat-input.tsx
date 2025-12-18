"use client";

import * as React from "react";
import { Send, Paperclip, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = "Message your agent...",
}: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Detect if input contains URL
  const containsUrl = /https?:\/\/[^\s]+/.test(value);

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-2xl border bg-bg-input transition-colors duration-200",
          disabled ? "border-border-subtle opacity-50" : "border-border-default focus-within:border-border-focus"
        )}
      >
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-2 mb-2 text-text-tertiary hover:text-text-secondary"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-transparent py-3 text-text-primary placeholder:text-text-tertiary",
            "focus:outline-none resize-none max-h-[200px]",
            "scrollbar-hidden"
          )}
        />

        {/* URL Indicator */}
        {containsUrl && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-accent-primary/10 text-accent-primary text-xs mb-2">
            <Link2 className="h-3 w-3" />
            <span>Link detected</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          size="icon"
          className={cn(
            "mr-2 mb-2 transition-all",
            value.trim() ? "bg-accent-primary hover:bg-accent-hover" : "bg-bg-tertiary"
          )}
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-text-tertiary text-center mt-2">
        Paste a product link or describe what you want to buy
      </p>
    </div>
  );
}

