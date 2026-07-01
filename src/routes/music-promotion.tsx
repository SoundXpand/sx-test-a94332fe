import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { ListMusic, Target, Share2, Radio, Newspaper, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/music-promotion")({
  head: () => ({
    meta: [
      { title: "Music Promotion — Playlist Pitching, Ads, PR | SoundXpand" },
      { name: "description", content: "Grow your audience with editorial playlist pitching, TikTok and Meta ads, radio plugging, PR campaigns and social content." },
      { property: "og:title", content: "Music Promotion — SoundXpand" },
      { property: "og:description", content: "Playlist pitching, paid ads, PR and radio. Full-stack promotion for independent artists." },
      { property: "og:url", content: "https://sx-test.lovable.app/music-promotion" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/music-promotion" }],
  }),
  component: PromoPage,
});

function PromoPage() {
  return (
    <SolutionPage
      accent="pink"
      eyebrow="Music Promotion"
      title={
        <>
          Get heard by the <span className="bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-orange)] bg-clip-text text-transparent">right ears</span>
        </>
      }
      subtitle="Releasing your song is 20% of the work. Getting it in front of listeners, playlist curators, journalists and radio programmers is the other 80% — and it's what we do."
      heroImage="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Crowd at a live music show with lights"
      stats={[
        { value: "10k+", label: "Editorial pitches / mo" },
        { value: "3.4x", label: "Avg. streams lift" },
        { value: "40+", label: "PR outlet partners" },
      ]}
      features={[
        { title: "Editorial playlist pitching", description: "Direct pitches to Spotify, Apple, Amazon, Deezer and Tidal curators.", icon: <ListMusic className="h-5 w-5" /> },
        { title: "Paid social ads", description: "TikTok, Meta, YouTube Shorts and Snap campaigns managed end-to-end.", icon: <Target className="h-5 w-5" /> },
        { title: "Influencer & UGC", description: "Sync your track to creators in your niche for organic reach.", icon: <Share2 className="h-5 w-5" /> },
        { title: "Radio plugging", description: "College, community and specialist radio in the US, UK and EU.", icon: <Radio className="h-5 w-5" /> },
        { title: "PR & press", description: "Blog reviews, features, interviews and premieres pitched by our team.", icon: <Newspaper className="h-5 w-5" /> },
        { title: "Growth analytics", description: "See which channel drove which streams, saves and follows.", icon: <TrendingUp className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "Editorial pitching",
          title: "Reach the humans who make playlists",
          body: "We maintain direct relationships with editors at Spotify, Apple Music, Amazon Music, Deezer, Tidal and YouTube Music. Every release gets a hand-crafted pitch with a story, a moment and a genre fit — not a template.",
          bullets: [
            "Pitch deck built from your artist bio and press hits",
            "Timed to the DSPs' internal editorial calendars",
            "Follow-up outreach to independent playlist curators",
            "Weekly reporting on adds, positions and stream velocity",
          ],
          image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Music editor curating a playlist on their laptop",
        },
        {
          eyebrow: "Paid growth",
          title: "Ads that actually turn views into fans",
          body: "Most artist ads waste money on cheap impressions. Our team runs conversion-optimized campaigns tied to real actions — saves on Spotify, follows on Instagram, presaves ahead of release day.",
          bullets: [
            "Multi-platform creative built from your artwork and clips",
            "Weekly budget optimization based on cost-per-save",
            "Lookalike audiences seeded from your existing fanbase",
            "Presave, release day and long-tail cascades",
          ],
          image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Social media manager reviewing ad campaigns",
        },
        {
          eyebrow: "PR & radio",
          title: "Earn coverage that builds a career",
          body: "A great feature in the right outlet is worth a million impressions of ads. Our PR arm books premieres, interviews and reviews with the tastemakers your audience actually reads and listens to.",
          image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Journalist interviewing an artist with microphone",
        },
      ]}
      faq={[
        { q: "Can you guarantee a spot on a Spotify editorial playlist?", a: "No one honest can. What we can guarantee is that your pitch lands with the right editor, on time, with a story that competes." },
        { q: "How much do campaigns cost?", a: "Playlist pitching starts at $99/release. Paid ad campaigns typically run $500–$5000 in media budget plus a management fee." },
        { q: "Do you work with all genres?", a: "Yes. Our roster spans hip-hop, indie, electronic, Latin, country, metal and beyond." },
        { q: "How soon do I see results?", a: "Playlist adds within 2–4 weeks. Ad campaigns start returning data within 48 hours." },
      ]}
      ctaTitle="Turn your next release into a moment"
      ctaSubtitle="Book a promo strategy call with our team."
    />
  );
}
