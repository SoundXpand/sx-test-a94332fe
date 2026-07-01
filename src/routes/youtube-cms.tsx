import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { Settings, Users, PlayCircle, Music2, TrendingUp, Layers } from "lucide-react";

export const Route = createFileRoute("/youtube-cms")({
  head: () => ({
    meta: [
      { title: "YouTube CMS & Art Track Ownership (AOC) | SoundXpand" },
      { name: "description", content: "Full YouTube CMS access, Art Track ownership and Official Artist Channel management. Enterprise-grade YouTube tooling for serious catalogues." },
      { property: "og:title", content: "YouTube CMS & AOC — SoundXpand" },
      { property: "og:description", content: "CMS access, Art Track ownership, OAC verification. Enterprise YouTube tools for artists and labels." },
      { property: "og:url", content: "https://sx-test.lovable.app/youtube-cms" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/youtube-cms" }],
  }),
  component: CmsPage,
});

function CmsPage() {
  return (
    <SolutionPage
      accent="cyan"
      eyebrow="YouTube CMS & AOC"
      title={
        <>
          Own your artist presence <span className="bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)] bg-clip-text text-transparent">on YouTube</span>
        </>
      }
      subtitle="YouTube's Content Management System is the professional interface that labels and premium partners use to control asset ownership, generate Art Tracks and manage Official Artist Channels. We give you access with human support attached."
      heroImage="https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Analytics dashboard on a laptop with music playing"
      stats={[
        { value: "OAC", label: "Verified artist channels" },
        { value: "AOC", label: "Auto-generated art tracks" },
        { value: "24h", label: "Priority YouTube support" },
      ]}
      features={[
        { title: "CMS console access", description: "Direct login to manage assets, policies, ownership and claims.", icon: <Settings className="h-5 w-5" /> },
        { title: "Official Artist Channel", description: "We handle OAC application, verification and consolidation.", icon: <Users className="h-5 w-5" /> },
        { title: "Art Track generation", description: "Auto-generated audio-only videos for every release on YouTube Music.", icon: <PlayCircle className="h-5 w-5" /> },
        { title: "Topic channel merging", description: "Consolidate scattered topic channels into your verified OAC.", icon: <Layers className="h-5 w-5" /> },
        { title: "Asset conflict resolution", description: "Priority routing to YouTube's partner team for stuck claims.", icon: <Music2 className="h-5 w-5" /> },
        { title: "Advanced analytics", description: "CMS-only metrics: watchtime by asset, geo lift, playlist adds.", icon: <TrendingUp className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "For serious catalogues",
          title: "The tools YouTube gives to labels, without the label deal",
          body: "CMS access is normally reserved for major labels and top-tier distributors. Through our partner status, we extend that same interface to independent artists and small labels with the volume to justify it.",
          bullets: [
            "Bulk ownership transfers and territorial policies",
            "Reference file management and match tuning",
            "Direct access to YouTube's partner support queue",
            "Compliance monitoring so your CMS access stays clean",
          ],
          image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Team reviewing YouTube analytics on multiple monitors",
        },
        {
          eyebrow: "OAC benefits",
          title: "The verified checkmark that actually matters",
          body: "An Official Artist Channel unifies music videos, topic channel content, live performances and vlogs under one verified identity — with the artist checkmark, custom shelves and \"Music by\" attribution.",
          bullets: [
            "Auto-generated \"Songs\" shelf populated from your releases",
            "Consolidated subscriber count across every source",
            "Custom playlists appear in YouTube Music search",
            "Charts eligibility for YouTube's global rankings",
          ],
          image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Musician performing live captured on camera",
        },
      ]}
      faq={[
        { q: "Who qualifies for CMS access?", a: "We evaluate based on catalogue size, release cadence and monetization potential. Typically 20+ commercial releases minimum." },
        { q: "Do you charge extra for OAC setup?", a: "OAC is included with any active distribution or Content ID account." },
        { q: "What is an Art Track?", a: "An auto-generated audio-only video YouTube creates for songs distributed to YouTube Music. They earn ads even without a music video." },
        { q: "Can you fix a broken OAC?", a: "Yes — if channels are mismatched or verification is stuck we escalate directly to the YouTube partner team." },
      ]}
      ctaTitle="Get enterprise YouTube tools for your catalogue"
      ctaSubtitle="Talk to us about CMS access, AOC setup and OAC verification."
    />
  );
}
