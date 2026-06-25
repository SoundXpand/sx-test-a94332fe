import logoDark from "@/assets/brand/sx-logo-dark.svg";
import logoLight from "@/assets/brand/sx-logo-white.svg";
import { cn } from "@/lib/utils";

/**
 * Unified SoundXpand brand logo. Swaps between light/dark variants
 * automatically based on Tailwind dark mode.
 */
export function BrandLogo({
  className,
  height = 28,
  alt = "SoundXpand",
}: { className?: string; height?: number; alt?: string }) {
  return (
    <>
      <img
        src={logoDark}
        alt={alt}
        height={height}
        style={{ height }}
        className={cn("w-auto block dark:hidden select-none", className)}
        draggable={false}
      />
      <img
        src={logoLight}
        alt={alt}
        height={height}
        style={{ height }}
        className={cn("w-auto hidden dark:block select-none", className)}
        draggable={false}
      />
    </>
  );
}
