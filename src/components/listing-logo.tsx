import { useState } from "react";
import { listingInitial, listingLogoUrl } from "@/lib/logo";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE = {
  sm: "size-7 text-xs",
  md: "size-8 text-sm",
  lg: "size-11 text-base",
} as const;

type Props = {
  type: string;
  targetKey: string;
  targetUrl: string;
  name: string;
  size?: Size;
};

export function ListingLogo({ type, targetKey, targetUrl, name, size = "md" }: Props) {
  const src = listingLogoUrl(type, targetKey, targetUrl);
  const [failed, setFailed] = useState(!src);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated ring-1 ring-border",
        SIZE[size],
      )}
      aria-hidden
    >
      {failed || !src ? (
        <span className="font-medium text-muted">{listingInitial(name)}</span>
      ) : (
        <img
          src={src}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
