import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Artwork image with skeleton placeholder + low-res blur fade. */
export function ArtworkImage({
  src, alt = "", className,
}: { src?: string | null; alt?: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative bg-muted overflow-hidden", className)}>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center animate-pulse">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105",
          )}
        />
      )}
    </div>
  );
}
