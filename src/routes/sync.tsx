import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { Film, Tv, Gamepad2, Megaphone, Briefcase, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sync")({
  head: () => ({
    meta: [
      { title: "Sync Licensing — Get Your Music in Film, TV, Ads & Games | SoundXpand" },
      { name: "description", content: "Pitch your catalogue to music supervisors, brands, agencies and game studios. Turn one placement into life-changing income." },
      { property: "og:title", content: "Sync Licensing — SoundXpand" },
      { property: "og:description", content: "Get your music placed in film, TV, ads, games and trailers. Non-exclusive pitching with real supervisors." },
      { property: "og:url", content: "https://sx-test.lovable.app/sync" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/sync" }],
  }),
  component: SyncPage,
});

function SyncPage() {
  return (
    <SolutionPage
      accent="orange"
      eyebrow="Sync Licensing"
      title={
        <>
          One placement can change <span className="bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-pink)] bg-clip-text text-transparent">everything</span>
        </>
      }
      subtitle="A single sync in a Netflix show, a Nike ad or an EA Sports game can pay more than a year of streaming — and put your name in front of millions. We put your catalogue in the rooms where those decisions get made."
      heroImage="https://images.unsplash.com/photo-1489599735734-79b4212bea72?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Film set with camera and cinematographer"
      stats={[
        { value: "$500+", label: "Avg. placement fee" },
        { value: "40k+", label: "Supervisor requests / yr" },
        { value: "0%", label: "Exclusivity required" },
      ]}
      features={[
        { title: "Film & TV", description: "Netflix, HBO, Amazon Prime, BBC, indie films — pitched weekly.", icon: <Film className="h-5 w-5" /> },
        { title: "Advertising", description: "Global brand campaigns, regional spots and social ads.", icon: <Megaphone className="h-5 w-5" /> },
        { title: "Games & trailers", description: "AAA studios, mobile hits, cinematic trailers and reveals.", icon: <Gamepad2 className="h-5 w-5" /> },
        { title: "Streaming originals", description: "Our team has direct lines to top music supervisors.", icon: <Tv className="h-5 w-5" /> },
        { title: "Agency network", description: "Placed on preferred-vendor lists at major creative agencies.", icon: <Briefcase className="h-5 w-5" /> },
        { title: "You keep control", description: "Non-exclusive. Approve every deal before it goes through.", icon: <Sparkles className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "Curated pitching",
          title: "Real supervisors, real briefs, real placements",
          body: "Our sync team is made up of former music supervisors and agency creatives. When a brief comes in — a Peloton ad, a HBO trailer, a car commercial — they hand-pick tracks from our catalogue and pitch them directly.",
          bullets: [
            "Weekly briefs from tier-1 supervisors and agencies",
            "Human curation, not algorithms — your track is heard",
            "Fully tagged and metadata-clean for fast supervisor search",
            "Instrumental and clean versions requested automatically",
          ],
          image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Advertising creatives reviewing storyboard",
        },
        {
          eyebrow: "Deal execution",
          title: "We handle the paperwork, you take the check",
          body: "Sync deals involve one-stop clearances, MFN clauses, holds, options, cue sheets — a legal minefield. Our licensing team negotiates every deal to industry-standard rates and gets contracts signed fast.",
          bullets: [
            "One-stop shop clearance (master + publishing)",
            "Standard rate cards for common use cases",
            "Custom quotes for major campaigns",
            "Cue sheet delivery so back-end royalties still flow",
          ],
          image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Contract signing at a desk",
        },
      ]}
      faq={[
        { q: "Do I need to be signed to a publisher?", a: "No — anyone with owned masters and publishing can pitch. Solo artists welcome." },
        { q: "How much do sync placements pay?", a: "It ranges wildly: a background cue on a small indie film may be $300, a national ad campaign can be $50,000+." },
        { q: "Is my music locked into an exclusive deal?", a: "Never. Everything is non-exclusive. You can pitch anywhere else too." },
        { q: "What genres do supervisors want?", a: "Everything — cinematic, hip-hop, indie folk, electronic, world. The brief is always changing." },
      ]}
      ctaTitle="Get your music into the sync brief pile"
      ctaSubtitle="Add your catalogue and start getting pitched to real supervisors."
    />
  );
}
