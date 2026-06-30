import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";
import distributionCss from "@/assets/landing-html/distribution.css?raw";
import distributionHtml from "@/assets/landing-html/distribution.html?raw";
import distributionJs from "@/assets/landing-html/distribution.js?raw";

export const Route = createFileRoute("/free-music-distribution")({
  head: () => ({
    meta: [
      { title: "Free music distribution to Spotify, Apple Music & 150+ stores — SoundXpand" },
      {
        name: "description",
        content:
          "Distribute your music for free to Spotify, Apple Music, YouTube Music, TikTok, JioSaavn and 150+ stores worldwide. Keep 100% of your rights and royalties.",
      },
      { property: "og:title", content: "Free music distribution — SoundXpand" },
      {
        property: "og:description",
        content:
          "Release your music to every major platform for free. Keep 100% rights, collect royalties on autopilot.",
      },
      { property: "og:url", content: "/free-music-distribution" },
      { name: "twitter:title", content: "Free music distribution — SoundXpand" },
      {
        name: "twitter:description",
        content:
          "Release your music to every major platform for free. Keep 100% rights and royalties.",
      },
    ],
    links: [{ rel: "canonical", href: "/free-music-distribution" }],
  }),
  component: FreeMusicDistributionPage,
});

function FreeMusicDistributionPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Execute inline scripts after markup is mounted
    const fn = new Function(distributionJs);
    try {
      fn();
    } catch (e) {
      console.error("[free-music-distribution] script error", e);
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: distributionCss }} />
      <div
        ref={ref}
        className="sx-distribution-page"
        dangerouslySetInnerHTML={{ __html: distributionHtml }}
      />
      <ContactUsBadge />
    </>
  );
}
