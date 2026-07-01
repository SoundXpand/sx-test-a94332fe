import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { Youtube, Shield, DollarSign, Search, Zap, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/youtube-content-id")({
  head: () => ({
    meta: [
      { title: "YouTube Content ID — Monetize Every Use of Your Music | SoundXpand" },
      { name: "description", content: "Protect and monetize your music on YouTube. We scan billions of videos for your tracks and turn every user upload into a revenue stream." },
      { property: "og:title", content: "YouTube Content ID — SoundXpand" },
      { property: "og:description", content: "Turn every user-generated video into revenue. Automatic fingerprinting, claim management and payouts." },
      { property: "og:url", content: "https://sx-test.lovable.app/youtube-content-id" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/youtube-content-id" }],
  }),
  component: ContentIdPage,
});

function ContentIdPage() {
  return (
    <SolutionPage
      accent="pink"
      eyebrow="YouTube Content ID"
      title={
        <>
          Every use of your music, <span className="bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-violet)] bg-clip-text text-transparent">turned into revenue</span>
        </>
      }
      subtitle="YouTube has 2+ billion logged-in users uploading videos daily. Content ID scans every one for your music and monetizes it automatically — even when it's used without permission."
      heroImage="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Content creator recording video with music equipment"
      stats={[
        { value: "2B+", label: "Videos scanned monthly" },
        { value: "24/7", label: "Automated monitoring" },
        { value: "80%", label: "Revenue share to you" },
      ]}
      features={[
        { title: "Audio fingerprinting", description: "Our system creates a unique fingerprint of your track and scans YouTube nonstop.", icon: <Search className="h-5 w-5" /> },
        { title: "Automatic claims", description: "Every match — from covers to reels to reaction videos — is claimed and monetized.", icon: <Zap className="h-5 w-5" /> },
        { title: "Copyright protection", description: "Block reuploads of your originals or monetize them. Your choice per track.", icon: <Shield className="h-5 w-5" /> },
        { title: "Dispute handling", description: "We manage disputes so your revenue keeps flowing without legal headaches.", icon: <Youtube className="h-5 w-5" /> },
        { title: "Detailed reporting", description: "See exactly which videos are earning, in which countries, at what rate.", icon: <BarChart3 className="h-5 w-5" /> },
        { title: "Fast payouts", description: "Monthly payments to your bank once your balance hits the threshold.", icon: <DollarSign className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "The problem",
          title: "Your music is already earning — you're just not being paid",
          body: "Right now, thousands of videos on YouTube use your tracks. Vlogs, gaming streams, dance clips, edits, covers — creators upload them without knowing where the music came from. Without Content ID, that ad revenue goes to YouTube, not you.",
          image: "https://images.unsplash.com/photo-1626379801357-537572d92b4d?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Creator streaming with camera and music setup",
        },
        {
          eyebrow: "The solution",
          title: "Set it and forget it",
          body: "Deliver your tracks once. From that point on our fingerprinting engine catches every new upload that contains your music — anywhere in the world, in any language — and monetizes it on your behalf.",
          bullets: [
            "Works with covers, remixes, sped-up and slowed-down versions",
            "Detects partial matches as short as 15 seconds",
            "Whitelist collaborators and channels you don't want to monetize",
            "Split revenue automatically with co-writers and producers",
          ],
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Music production with mixer and headphones",
        },
        {
          eyebrow: "Eligibility",
          title: "Original music only — we vet everything",
          body: "Content ID requires exclusive audio rights. We manually review every submission to protect the network from false claims and keep your account in good standing with YouTube.",
          bullets: [
            "You must own the master recording",
            "No royalty-free, stock, or public domain samples",
            "Clean stem uploads help maximize claim accuracy",
            "Rejected tracks receive detailed feedback",
          ],
          image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Sound engineer at mixing desk",
        },
      ]}
      faq={[
        { q: "How is this different from regular YouTube monetization?", a: "Regular monetization pays when your music plays on your channel. Content ID monetizes YOUR music on EVERY OTHER channel too — that's where the real volume is." },
        { q: "Will I lose control of my tracks?", a: "No. You can pull tracks from the system anytime. We only claim usages, we don't own your masters." },
        { q: "Can I still upload the same tracks to my own YouTube channel?", a: "Absolutely. Your own channel is whitelisted automatically." },
        { q: "What percentage do I keep?", a: "80% of the net ad revenue. Payouts are monthly with no minimum threshold after the first payment." },
      ]}
      ctaTitle="Turn every UGC video into recurring revenue"
      ctaSubtitle="Get your catalogue into Content ID this week."
    />
  );
}
