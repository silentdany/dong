import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-sm border border-border bg-bg px-3 text-base text-fg placeholder:text-subtle",
        "transition-[border-color,box-shadow,background-color,color] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-track disabled:text-muted disabled:placeholder:text-subtle disabled:opacity-100 disabled:focus-visible:ring-0",
        "read-only:cursor-not-allowed read-only:border-border read-only:bg-track read-only:text-muted read-only:focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}
